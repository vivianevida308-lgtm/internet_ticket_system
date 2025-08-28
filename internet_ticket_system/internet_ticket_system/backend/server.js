require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const promClient = require('prom-client');
const winston = require('winston');
const { SplunkLogger } = require('winston-splunk-httplogger');
const { initHttpMetrics, systemMetrics } = require('./middleware/metrics');
const { requestLogger, configureLogger } = require('./middleware/logging');

// Configuração do Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Configuração do Prometheus para métricas
const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();
collectDefaultMetrics({ register });

// Métricas personalizadas
const ticketsCounter = new promClient.Counter({
  name: 'tickets_total',
  help: 'Total de tickets criados',
  labelNames: ['status'],
  registers: [register]
});

const ticketResponseTime = new promClient.Histogram({
  name: 'ticket_response_time_seconds',
  help: 'Tempo de resposta para tickets em segundos',
  buckets: [1, 5, 10, 30, 60, 300, 600, 1800],
  registers: [register]
});

// Configuração do Logger
const config = {
  logLevel: process.env.LOG_LEVEL || 'info',
  splunk: {
    host: process.env.SPLUNK_URL,
    token: process.env.SPLUNK_TOKEN,
    index: process.env.SPLUNK_INDEX || 'main',
    sourcetype: 'internet_ticket_system',
    source: 'internet-ticket-system'
  }
};

const logger = configureLogger(config);

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-system')
  .then(() => {
    logger.info('Conectado ao MongoDB');
  })
  .catch((err) => {
    logger.error('Erro ao conectar ao MongoDB:', err);
  });

// Inicializar métricas HTTP e sistema
const httpMetricsMiddleware = initHttpMetrics(register);
systemMetrics(register);

// Adicionar middleware de métricas e logging
app.use(httpMetricsMiddleware);
app.use(requestLogger);

// Rotas
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/external', require('./routes/external-api'));

// Rota para métricas do Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

module.exports = { app, ticketsCounter, ticketResponseTime, logger };