const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { ticketsCounter, ticketResponseTime, logger } = require('../server');
const { authenticate, authorize } = require('../middleware/auth');
const { validateTicketCreation, validateTicketUpdate } = require('../middleware/validation');
const IpifyService = require('../services/ipify');

// Função para obter IP do cliente e informações geográficas
async function getClientIpInfo() {
  try {
    const ip = await IpifyService.getClientIp();
    if (ip) {
      const ipInfo = await IpifyService.getIpInfo(ip);
      return { ip, ...ipInfo };
    }
    return { ip: null };
  } catch (error) {
    logger.error('Erro ao obter informações do IP do cliente:', error);
    return { ip: null };
  }
}

// Listar todos os tickets
router.get('/', authenticate, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    logger.error('Erro ao listar tickets:', error);
    res.status(500).json({ message: 'Erro ao listar tickets', error: error.message });
  }
});

// Obter ticket por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .populate('history.updatedBy', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }
    
    res.json(ticket);
  } catch (error) {
    logger.error(`Erro ao buscar ticket ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao buscar ticket', error: error.message });
  }
});

// Criar novo ticket
router.post('/', authenticate, validateTicketCreation, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { title, description, category, priority, userId } = req.body;
    
    // Obter IP do cliente e informações geográficas
    const clientIpInfo = await getClientIpInfo();
    const clientIp = clientIpInfo.ip;
    
    const ticket = new Ticket({
      title,
      description,
      category,
      priority,
      userId,
      clientIp
    });
    
    // Calcular SLA
    ticket.calculateSLA();
    
    // Adicionar entrada inicial no histórico
    ticket.addHistory('aberto', 'Ticket criado', userId);
    
    await ticket.save();
    
    // Incrementar contador de tickets
    ticketsCounter.inc({ status: 'aberto' });
    
    // Registrar no log
    logger.info(`Novo ticket criado: ${ticket.ticketId}`, { ticketId: ticket.ticketId, userId });
    
    res.status(201).json(ticket);
    
    // Registrar tempo de resposta
    const responseTime = (Date.now() - startTime) / 1000;
    ticketResponseTime.observe(responseTime);
    
  } catch (error) {
    logger.error('Erro ao criar ticket:', error);
    res.status(500).json({ message: 'Erro ao criar ticket', error: error.message });
  }
});

// Atualizar ticket
router.put('/:id', authenticate, authorize(['tecnico', 'admin']), validateTicketUpdate, async (req, res) => {
  try {
    const { status, comment, assignedTo, priority } = req.body;
    const userId = req.body.updatedBy; // ID do usuário que está atualizando
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }
    
    // Atualizar campos
    if (status) {
      ticket.addHistory(status, comment || `Status alterado para ${status}`, userId);
      
      // Incrementar contador de tickets por status
      ticketsCounter.inc({ status });
    }
    
    if (assignedTo) {
      ticket.assignedTo = assignedTo;
      if (!comment) {
        ticket.addHistory(ticket.status, `Ticket atribuído a novo técnico`, userId);
      }
    }
    
    if (priority && priority !== ticket.priority) {
      ticket.priority = priority;
      ticket.calculateSLA(); // Recalcular SLA se a prioridade mudar
      if (!comment) {
        ticket.addHistory(ticket.status, `Prioridade alterada para ${priority}`, userId);
      }
    }
    
    await ticket.save();
    
    // Registrar no log
    logger.info(`Ticket atualizado: ${ticket.ticketId}`, { 
      ticketId: ticket.ticketId, 
      userId,
      newStatus: status || ticket.status 
    });
    
    res.json(ticket);
    
  } catch (error) {
    logger.error(`Erro ao atualizar ticket ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao atualizar ticket', error: error.message });
  }
});

// Excluir ticket (soft delete - apenas para admins)
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }
    
    // Adicionar histórico de exclusão
    ticket.addHistory('fechado', 'Ticket excluído pelo administrador', req.body.userId);
    ticket.active = false;
    
    await ticket.save();
    
    logger.info(`Ticket excluído: ${ticket.ticketId}`, { 
      ticketId: ticket.ticketId, 
      userId: req.body.userId 
    });
    
    res.json({ message: 'Ticket excluído com sucesso' });
    
  } catch (error) {
    logger.error(`Erro ao excluir ticket ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao excluir ticket', error: error.message });
  }
});

// Obter métricas de tickets
router.get('/metrics/summary', authenticate, authorize(['tecnico', 'admin']), async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'aberto' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'em_andamento' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolvido' });
    const closedTickets = await Ticket.countDocuments({ status: 'fechado' });
    
    // Calcular tickets com SLA vencido
    const now = new Date();
    const overdueSLA = await Ticket.countDocuments({
      status: { $in: ['aberto', 'em_andamento'] },
      slaDeadline: { $lt: now }
    });
    
    // Tempo médio de resolução (em horas)
    const resolvedTicketsData = await Ticket.find({
      status: 'resolvido',
      resolvedAt: { $exists: true },
      createdAt: { $exists: true }
    });
    
    let avgResolutionTime = 0;
    if (resolvedTicketsData.length > 0) {
      const totalResolutionTime = resolvedTicketsData.reduce((sum, ticket) => {
        const resolutionTime = ticket.resolvedAt - ticket.createdAt;
        return sum + resolutionTime;
      }, 0);
      
      avgResolutionTime = totalResolutionTime / resolvedTicketsData.length / (1000 * 60 * 60); // em horas
    }
    
    res.json({
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      overdueSLA,
      avgResolutionTime
    });
    
  } catch (error) {
    logger.error('Erro ao obter métricas de tickets:', error);
    res.status(500).json({ message: 'Erro ao obter métricas', error: error.message });
  }
});

module.exports = router;