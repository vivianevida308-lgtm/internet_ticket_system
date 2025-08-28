const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { logger } = require('../server');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * Rota para obter métricas de negócio para o dashboard
 * Restrito a usuários com papel de admin
 */
router.get('/', authenticate, authorize(['admin', 'tecnico']), async (req, res) => {
  try {
    // Período de análise (padrão: últimos 30 dias)
    const days = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Métricas de tickets
    const ticketMetrics = await getTicketMetrics(startDate, endDate);
    
    // Métricas de usuários
    const userMetrics = await getUserMetrics();
    
    // Métricas de SLA
    const slaMetrics = await getSLAMetrics(startDate, endDate);
    
    // Métricas de desempenho
    const performanceMetrics = await getPerformanceMetrics(startDate, endDate);
    
    res.json({
      period: {
        start: startDate,
        end: endDate,
        days
      },
      tickets: ticketMetrics,
      users: userMetrics,
      sla: slaMetrics,
      performance: performanceMetrics
    });
    
  } catch (error) {
    logger.error('Erro ao obter métricas para dashboard:', error);
    res.status(500).json({ message: 'Erro ao obter métricas para dashboard', error: error.message });
  }
});

/**
 * Obter métricas de tickets
 */
async function getTicketMetrics(startDate, endDate) {
  // Total de tickets no período
  const totalTickets = await Ticket.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });
  
  // Tickets por status
  const ticketsByStatus = await Ticket.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Tickets por categoria
  const ticketsByCategory = await Ticket.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  // Tickets por prioridade
  const ticketsByPriority = await Ticket.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);
  
  // Tickets criados por dia
  const ticketsByDay = await Ticket.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return {
    total: totalTickets,
    byStatus: ticketsByStatus.reduce((acc, item) => {
      acc[item._id || 'sem_status'] = item.count;
      return acc;
    }, {}),
    byCategory: ticketsByCategory.reduce((acc, item) => {
      acc[item._id || 'sem_categoria'] = item.count;
      return acc;
    }, {}),
    byPriority: ticketsByPriority.reduce((acc, item) => {
      acc[item._id || 'sem_prioridade'] = item.count;
      return acc;
    }, {}),
    byDay: ticketsByDay.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
}

/**
 * Obter métricas de usuários
 */
async function getUserMetrics() {
  // Total de usuários por papel
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  
  // Usuários ativos vs. inativos
  const activeUsers = await User.countDocuments({ active: true });
  const inactiveUsers = await User.countDocuments({ active: false });
  
  // Técnicos com mais tickets atribuídos
  const technicianWorkload = await Ticket.aggregate([
    { $match: { assignedTo: { $exists: true, $ne: null } } },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $project: { _id: 1, count: 1, name: '$user.name' } }
  ]);
  
  return {
    byRole: usersByRole.reduce((acc, item) => {
      acc[item._id || 'sem_papel'] = item.count;
      return acc;
    }, {}),
    active: activeUsers,
    inactive: inactiveUsers,
    technicianWorkload
  };
}

/**
 * Obter métricas de SLA
 */
async function getSLAMetrics(startDate, endDate) {
  // Tickets com SLA vencido
  const overdueSLA = await Ticket.countDocuments({
    status: { $in: ['aberto', 'em_andamento'] },
    slaDeadline: { $lt: new Date() }
  });
  
  // Tickets resolvidos dentro do SLA
  const resolvedWithinSLA = await Ticket.countDocuments({
    status: 'resolvido',
    resolvedAt: { $lte: '$slaDeadline' }
  });
  
  // Tickets resolvidos fora do SLA
  const resolvedOutsideSLA = await Ticket.countDocuments({
    status: 'resolvido',
    resolvedAt: { $gt: '$slaDeadline' }
  });
  
  // SLA por prioridade
  const slaByPriority = await Ticket.aggregate([
    {
      $match: {
        status: { $in: ['aberto', 'em_andamento'] },
        slaDeadline: { $exists: true }
      }
    },
    {
      $project: {
        priority: 1,
        isOverdue: { $cond: [{ $lt: ['$slaDeadline', new Date()] }, 1, 0] }
      }
    },
    {
      $group: {
        _id: '$priority',
        total: { $sum: 1 },
        overdue: { $sum: '$isOverdue' }
      }
    }
  ]);
  
  return {
    overdue: overdueSLA,
    resolvedWithinSLA,
    resolvedOutsideSLA,
    byPriority: slaByPriority.reduce((acc, item) => {
      acc[item._id] = {
        total: item.total,
        overdue: item.overdue,
        withinSLA: item.total - item.overdue,
        percentOverdue: (item.overdue / item.total) * 100
      };
      return acc;
    }, {})
  };
}

/**
 * Obter métricas de desempenho
 */
async function getPerformanceMetrics(startDate, endDate) {
  // Tempo médio de resolução por prioridade (em horas)
  const avgResolutionByPriority = await Ticket.aggregate([
    {
      $match: {
        status: 'resolvido',
        resolvedAt: { $exists: true },
        createdAt: { $exists: true }
      }
    },
    {
      $project: {
        priority: 1,
        resolutionTime: {
          $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000] // ms para horas
        }
      }
    },
    {
      $group: {
        _id: '$priority',
        avgTime: { $avg: '$resolutionTime' },
        minTime: { $min: '$resolutionTime' },
        maxTime: { $max: '$resolutionTime' }
      }
    }
  ]);
  
  // Tempo médio de primeira resposta (em horas)
  const avgFirstResponseTime = await Ticket.aggregate([
    {
      $match: {
        'history.1': { $exists: true },
        createdAt: { $exists: true }
      }
    },
    {
      $project: {
        firstResponseTime: {
          $divide: [{ $subtract: ['$history.1.date', '$createdAt'] }, 3600000] // ms para horas
        }
      }
    },
    {
      $group: {
        _id: null,
        avgTime: { $avg: '$firstResponseTime' },
        minTime: { $min: '$firstResponseTime' },
        maxTime: { $max: '$firstResponseTime' }
      }
    }
  ]);
  
  return {
    resolutionByPriority: avgResolutionByPriority.reduce((acc, item) => {
      acc[item._id] = {
        avg: parseFloat(item.avgTime.toFixed(2)),
        min: parseFloat(item.minTime.toFixed(2)),
        max: parseFloat(item.maxTime.toFixed(2))
      };
      return acc;
    }, {}),
    firstResponse: avgFirstResponseTime.length > 0 ? {
      avg: parseFloat(avgFirstResponseTime[0].avgTime.toFixed(2)),
      min: parseFloat(avgFirstResponseTime[0].minTime.toFixed(2)),
      max: parseFloat(avgFirstResponseTime[0].maxTime.toFixed(2))
    } : { avg: 0, min: 0, max: 0 }
  };
}

module.exports = router;