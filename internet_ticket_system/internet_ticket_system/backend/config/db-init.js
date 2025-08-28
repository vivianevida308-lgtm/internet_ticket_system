const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

// Função para inicializar o banco de dados com dados de exemplo
async function initializeDatabase() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-system');
    console.log('Conectado ao MongoDB');
    
    // Limpar coleções existentes
    await User.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Coleções limpas');
    
    // Criar usuários de exemplo
    const users = await User.insertMany([
      {
        name: 'Admin Sistema',
        email: 'admin@exemplo.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Técnico Suporte',
        email: 'tecnico@exemplo.com',
        password: 'tecnico123',
        role: 'tecnico'
      },
      {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'joao123',
        role: 'cliente'
      },
      {
        name: 'Maria Oliveira',
        email: 'maria@exemplo.com',
        password: 'maria123',
        role: 'cliente'
      }
    ]);
    
    console.log(`${users.length} usuários criados`);
    
    // Criar tickets de exemplo
    const adminId = users[0]._id;
    const tecnicoId = users[1]._id;
    const clienteId1 = users[2]._id;
    const clienteId2 = users[3]._id;
    
    // Função para gerar data aleatória nos últimos 30 dias
    const randomDate = () => {
      const now = new Date();
      const daysAgo = Math.floor(Math.random() * 30);
      return new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    };
    
    // Criar tickets
    const tickets = [];
    
    // Ticket 1 - Aberto
    const ticket1 = new Ticket({
      title: 'Internet lenta durante horário de pico',
      description: 'Minha conexão fica muito lenta entre 19h e 22h todos os dias.',
      category: 'velocidade',
      priority: 'média',
      userId: clienteId1,
      clientIp: '187.54.123.45',
      createdAt: randomDate()
    });
    ticket1.calculateSLA();
    ticket1.addHistory('aberto', 'Ticket criado', clienteId1);
    tickets.push(ticket1);
    
    // Ticket 2 - Em andamento
    const ticket2 = new Ticket({
      title: 'Conexão caindo frequentemente',
      description: 'Minha internet cai várias vezes ao dia, preciso reconectar o roteador.',
      category: 'instabilidade',
      priority: 'alta',
      userId: clienteId2,
      assignedTo: tecnicoId,
      clientIp: '187.54.123.46',
      createdAt: randomDate()
    });
    ticket2.calculateSLA();
    ticket2.addHistory('aberto', 'Ticket criado', clienteId2);
    ticket2.addHistory('em_andamento', 'Iniciando análise do problema', tecnicoId);
    tickets.push(ticket2);
    
    // Ticket 3 - Resolvido
    const ticket3 = new Ticket({
      title: 'Não consigo acessar sites específicos',
      description: 'Alguns sites como Netflix e YouTube não carregam, mas outros funcionam normalmente.',
      category: 'conexão',
      priority: 'média',
      userId: clienteId1,
      assignedTo: tecnicoId,
      clientIp: '187.54.123.45',
      createdAt: randomDate()
    });
    ticket3.calculateSLA();
    const createdDate = new Date(ticket3.createdAt);
    const resolvedDate = new Date(createdDate.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 dias depois
    ticket3.addHistory('aberto', 'Ticket criado', clienteId1);
    ticket3.addHistory('em_andamento', 'Verificando configurações de DNS', tecnicoId);
    ticket3.addHistory('resolvido', 'Problema resolvido. Configurações de DNS ajustadas.', tecnicoId);
    ticket3.resolvedAt = resolvedDate;
    tickets.push(ticket3);
    
    // Ticket 4 - Fechado
    const ticket4 = new Ticket({
      title: 'Roteador não liga',
      description: 'Meu roteador parou de funcionar completamente.',
      category: 'configuração',
      priority: 'crítica',
      userId: clienteId2,
      assignedTo: tecnicoId,
      clientIp: '187.54.123.46',
      createdAt: randomDate()
    });
    ticket4.calculateSLA();
    const ticket4CreatedDate = new Date(ticket4.createdAt);
    const ticket4ResolvedDate = new Date(ticket4CreatedDate.getTime() + (1 * 24 * 60 * 60 * 1000)); // 1 dia depois
    const ticket4ClosedDate = new Date(ticket4ResolvedDate.getTime() + (1 * 24 * 60 * 60 * 1000)); // 1 dia após resolução
    ticket4.addHistory('aberto', 'Ticket criado', clienteId2);
    ticket4.addHistory('em_andamento', 'Enviando técnico para verificação', tecnicoId);
    ticket4.addHistory('resolvido', 'Roteador substituído por um novo equipamento', tecnicoId);
    ticket4.addHistory('fechado', 'Cliente confirmou que o problema foi resolvido', adminId);
    ticket4.resolvedAt = ticket4ResolvedDate;
    tickets.push(ticket4);
    
    // Salvar tickets
    await Promise.all(tickets.map(ticket => ticket.save()));
    console.log(`${tickets.length} tickets criados`);
    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  } finally {
    // Desconectar do MongoDB
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  require('dotenv').config();
  initializeDatabase();
}

module.exports = { initializeDatabase };