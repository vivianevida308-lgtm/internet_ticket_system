const promClient = require('prom-client');
const { logger } = require('../server');

// Middleware para capturar métricas de requisições HTTP
const httpMetrics = (req, res, next) => {
  const start = Date.now();
  
  // Adicionar listener para quando a resposta for finalizada
  res.on('finish', () => {
    const duration = Date.now() - start;
    const path = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    
    // Registrar métricas de duração da requisição
    if (global.httpRequestDuration) {
      global.httpRequestDuration.observe(
        { method, path, status_code: statusCode },
        duration / 1000 // converter para segundos
      );
    }
    
    // Incrementar contador de requisições
    if (global.httpRequestsTotal) {
      global.httpRequestsTotal.inc({ method, path, status_code: statusCode });
    }
    
    // Registrar no log para requisições lentas (mais de 1 segundo)
    if (duration > 1000) {
      logger.warn(`Requisição lenta: ${method} ${path} - ${duration}ms`, {
        method,
        path,
        duration,
        statusCode
      });
    }
  });
  
  next();
};

// Inicializar métricas HTTP
const initHttpMetrics = (registry) => {
  // Contador de requisições HTTP
  global.httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total de requisições HTTP',
    labelNames: ['method', 'path', 'status_code'],
    registers: [registry]
  });
  
  // Histograma de duração de requisições HTTP
  global.httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'path', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    registers: [registry]
  });
  
  // Gauge para conexões ativas
  global.httpActiveConnections = new promClient.Gauge({
    name: 'http_active_connections',
    help: 'Número de conexões HTTP ativas',
    registers: [registry]
  });
  
  // Inicializar com zero conexões
  global.httpActiveConnections.set(0);
  
  return httpMetrics;
};

// Middleware para monitorar recursos do sistema
const systemMetrics = (registry) => {
  // Métricas de CPU
  new promClient.Gauge({
    name: 'process_cpu_user_seconds_total',
    help: 'Tempo total de CPU em modo usuário',
    collect() {
      const usage = process.cpuUsage();
      this.set(usage.user / 1000000); // converter para segundos
    },
    registers: [registry]
  });
  
  // Métricas de memória
  new promClient.Gauge({
    name: 'process_memory_usage_bytes',
    help: 'Uso de memória do processo em bytes',
    labelNames: ['type'],
    collect() {
      const memoryUsage = process.memoryUsage();
      this.set({ type: 'rss' }, memoryUsage.rss);
      this.set({ type: 'heapTotal' }, memoryUsage.heapTotal);
      this.set({ type: 'heapUsed' }, memoryUsage.heapUsed);
      this.set({ type: 'external' }, memoryUsage.external);
    },
    registers: [registry]
  });
  
  // Métricas de eventos de loop de eventos
  new promClient.Gauge({
    name: 'nodejs_eventloop_lag_seconds',
    help: 'Lag do loop de eventos em segundos',
    collect() {
      const start = Date.now();
      setImmediate(() => {
        const lag = (Date.now() - start) / 1000;
        this.set(lag);
      });
    },
    registers: [registry]
  });
};

module.exports = { initHttpMetrics, systemMetrics };