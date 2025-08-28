const { logger } = require('../server');

// Middleware para verificar autenticação
const authenticate = (req, res, next) => {
  // Em um ambiente de produção, isso seria implementado com JWT
  // Para simplificar, estamos apenas verificando se existe um token no header
  const token = req.headers.authorization;
  
  if (!token) {
    logger.warn('Tentativa de acesso sem token de autenticação');
    return res.status(401).json({ message: 'Autenticação necessária' });
  }
  
  // Simulação de verificação de token
  // Em produção, verificaria a validade do JWT
  if (token === 'Bearer token-simulado') {
    // Simulando informações do usuário
    req.user = {
      id: '123456789',
      role: req.headers['x-user-role'] || 'cliente' // Para testes
    };
    return next();
  }
  
  logger.warn('Tentativa de acesso com token inválido');
  return res.status(401).json({ message: 'Token inválido' });
};

// Middleware para verificar autorização por papel
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Tentativa de autorização sem usuário autenticado');
      return res.status(401).json({ message: 'Autenticação necessária' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      logger.warn(`Usuário com papel ${req.user.role} tentou acessar rota restrita a ${roles.join(', ')}`);
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };