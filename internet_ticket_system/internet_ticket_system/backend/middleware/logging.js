const winston = require('winston');
const { SplunkStreamEvent } = require('winston-splunk-httplogger');
const { logger } = require('../server');

// Middleware para logging de requisições HTTP
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  // Adicionar requestId ao objeto de requisição para uso em outros lugares
  req.requestId = requestId;
  
  // Registrar início da requisição
  logger.info(`Requisição iniciada: ${req.method} ${req.originalUrl}`, {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    referrer: req.headers['referer'] || req.headers['referrer'],
    userId: req.user ? req.user.id : 'anônimo'
  });
  
  // Adicionar listener para quando a resposta for finalizada
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Determinar nível de log baseado no status code
    let logLevel = 'info';
    if (res.statusCode >= 500) {
      logLevel = 'error';
    } else if (res.statusCode >= 400) {
      logLevel = 'warn';
    }
    
    // Registrar finalização da requisição
    logger[logLevel](`Requisição finalizada: ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user ? req.user.id : 'anônimo'
    });
  });
  
  next();
};

// Configurar logger do Splunk
const configureSplunkLogger = (config) => {
  if (!config.splunk || !config.splunk.host || !config.splunk.token) {
    console.warn('Configuração do Splunk incompleta. Logs não serão enviados para o Splunk.');
    return null;
  }
  
  try {
    const splunkTransport = new SplunkStreamEvent({
      splunk: {
        host: config.splunk.host,
        token: config.splunk.token,
        index: config.splunk.index || 'main',
        sourcetype: config.splunk.sourcetype || 'internet_ticket_system',
        source: config.splunk.source || 'nodejs',
        eventFormatter: (message, severity) => {
          return {
            message: message.message,
            severity: severity,
            metadata: message.metadata || {},
            timestamp: new Date().toISOString()
          };
        }
      }
    });
    
    return splunkTransport;
  } catch (error) {
    console.error('Erro ao configurar transporte do Splunk:', error);
    return null;
  }
};

// Configurar logger do Winston
const configureLogger = (config) => {
  const transports = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
          return `${timestamp} ${level}: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
        })
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ];
  
  // Adicionar transporte do Splunk se configurado
  const splunkTransport = configureSplunkLogger(config);
  if (splunkTransport) {
    transports.push(splunkTransport);
  }
  
  return winston.createLogger({
    level: config.logLevel || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: 'internet-ticket-system' },
    transports
  });
};

module.exports = { requestLogger, configureLogger };