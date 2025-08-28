const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['aberto', 'em_andamento', 'resolvido', 'fechado'],
    default: 'aberto'
  },
  priority: {
    type: String,
    enum: ['baixa', 'média', 'alta', 'crítica'],
    default: 'média'
  },
  category: {
    type: String,
    enum: ['conexão', 'velocidade', 'instabilidade', 'configuração', 'outro'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  clientIp: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  slaDeadline: {
    type: Date
  },
  history: [{
    status: String,
    comment: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Método para calcular SLA com base na prioridade
ticketSchema.methods.calculateSLA = function() {
  const now = new Date();
  let deadline;
  
  switch(this.priority) {
    case 'crítica':
      deadline = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 horas
      break;
    case 'alta':
      deadline = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 horas
      break;
    case 'média':
      deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas
      break;
    case 'baixa':
      deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 horas
      break;
    default:
      deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas (padrão)
  }
  
  this.slaDeadline = deadline;
  return deadline;
};

// Método para adicionar entrada no histórico
ticketSchema.methods.addHistory = function(status, comment, userId) {
  this.history.push({
    status,
    comment,
    updatedBy: userId,
    timestamp: new Date()
  });
  
  this.status = status;
  this.updatedAt = new Date();
  
  if (status === 'resolvido') {
    this.resolvedAt = new Date();
  }
};

// Gerar ID de ticket único
ticketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const date = new Date();
    const year = date.getFullYear();
    const count = await mongoose.model('Ticket').countDocuments() + 1;
    this.ticketId = `TK-${year}-${count.toString().padStart(3, '0')}`;
  }
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;