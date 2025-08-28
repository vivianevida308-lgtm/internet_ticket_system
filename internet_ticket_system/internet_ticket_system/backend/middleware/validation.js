const { logger } = require('../server');

// Validação para criação de ticket
const validateTicketCreation = (req, res, next) => {
  const { title, description, priority, category } = req.body;
  const errors = [];
  
  // Validar campos obrigatórios
  if (!title || title.trim() === '') {
    errors.push('Título é obrigatório');
  } else if (title.length < 5 || title.length > 100) {
    errors.push('Título deve ter entre 5 e 100 caracteres');
  }
  
  if (!description || description.trim() === '') {
    errors.push('Descrição é obrigatória');
  } else if (description.length < 10 || description.length > 1000) {
    errors.push('Descrição deve ter entre 10 e 1000 caracteres');
  }
  
  // Validar prioridade
  const validPriorities = ['baixa', 'média', 'alta', 'crítica'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push(`Prioridade deve ser uma das seguintes: ${validPriorities.join(', ')}`);
  }
  
  // Validar categoria
  const validCategories = ['conexão', 'velocidade', 'intermitência', 'configuração', 'outro'];
  if (category && !validCategories.includes(category)) {
    errors.push(`Categoria deve ser uma das seguintes: ${validCategories.join(', ')}`);
  }
  
  // Se houver erros, retornar resposta com erros
  if (errors.length > 0) {
    logger.warn('Validação falhou na criação de ticket', { errors, body: req.body });
    return res.status(400).json({ message: 'Erro de validação', errors });
  }
  
  next();
};

// Validação para atualização de ticket
const validateTicketUpdate = (req, res, next) => {
  const { title, description, status, priority, assignedTo } = req.body;
  const errors = [];
  
  // Validar título se fornecido
  if (title !== undefined) {
    if (title.trim() === '') {
      errors.push('Título não pode ser vazio');
    } else if (title.length < 5 || title.length > 100) {
      errors.push('Título deve ter entre 5 e 100 caracteres');
    }
  }
  
  // Validar descrição se fornecida
  if (description !== undefined) {
    if (description.trim() === '') {
      errors.push('Descrição não pode ser vazia');
    } else if (description.length < 10 || description.length > 1000) {
      errors.push('Descrição deve ter entre 10 e 1000 caracteres');
    }
  }
  
  // Validar status se fornecido
  const validStatuses = ['aberto', 'em_andamento', 'resolvido', 'fechado'];
  if (status !== undefined && !validStatuses.includes(status)) {
    errors.push(`Status deve ser um dos seguintes: ${validStatuses.join(', ')}`);
  }
  
  // Validar prioridade se fornecida
  const validPriorities = ['baixa', 'média', 'alta', 'crítica'];
  if (priority !== undefined && !validPriorities.includes(priority)) {
    errors.push(`Prioridade deve ser uma das seguintes: ${validPriorities.join(', ')}`);
  }
  
  // Se houver erros, retornar resposta com erros
  if (errors.length > 0) {
    logger.warn('Validação falhou na atualização de ticket', { errors, body: req.body });
    return res.status(400).json({ message: 'Erro de validação', errors });
  }
  
  next();
};

// Validação para criação de usuário
const validateUserCreation = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];
  
  // Validar campos obrigatórios
  if (!name || name.trim() === '') {
    errors.push('Nome é obrigatório');
  } else if (name.length < 3 || name.length > 100) {
    errors.push('Nome deve ter entre 3 e 100 caracteres');
  }
  
  if (!email || email.trim() === '') {
    errors.push('Email é obrigatório');
  } else {
    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email inválido');
    }
  }
  
  if (!password || password.trim() === '') {
    errors.push('Senha é obrigatória');
  } else if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }
  
  // Validar papel se fornecido
  const validRoles = ['cliente', 'tecnico', 'admin'];
  if (role && !validRoles.includes(role)) {
    errors.push(`Papel deve ser um dos seguintes: ${validRoles.join(', ')}`);
  }
  
  // Se houver erros, retornar resposta com erros
  if (errors.length > 0) {
    logger.warn('Validação falhou na criação de usuário', { errors, body: { ...req.body, password: '[REDACTED]' } });
    return res.status(400).json({ message: 'Erro de validação', errors });
  }
  
  next();
};

// Validação para atualização de usuário
const validateUserUpdate = (req, res, next) => {
  const { name, email, role, active } = req.body;
  const errors = [];
  
  // Validar nome se fornecido
  if (name !== undefined) {
    if (name.trim() === '') {
      errors.push('Nome não pode ser vazio');
    } else if (name.length < 3 || name.length > 100) {
      errors.push('Nome deve ter entre 3 e 100 caracteres');
    }
  }
  
  // Validar email se fornecido
  if (email !== undefined) {
    if (email.trim() === '') {
      errors.push('Email não pode ser vazio');
    } else {
      // Validação simples de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Email inválido');
      }
    }
  }
  
  // Validar papel se fornecido
  const validRoles = ['cliente', 'tecnico', 'admin'];
  if (role !== undefined && !validRoles.includes(role)) {
    errors.push(`Papel deve ser um dos seguintes: ${validRoles.join(', ')}`);
  }
  
  // Validar status ativo se fornecido
  if (active !== undefined && typeof active !== 'boolean') {
    errors.push('Status ativo deve ser um valor booleano');
  }
  
  // Se houver erros, retornar resposta com erros
  if (errors.length > 0) {
    logger.warn('Validação falhou na atualização de usuário', { errors, body: req.body });
    return res.status(400).json({ message: 'Erro de validação', errors });
  }
  
  next();
};

module.exports = {
  validateTicketCreation,
  validateTicketUpdate,
  validateUserCreation,
  validateUserUpdate
};