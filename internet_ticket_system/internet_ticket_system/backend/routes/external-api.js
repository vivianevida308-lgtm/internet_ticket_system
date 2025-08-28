const express = require('express');
const router = express.Router();
const { logger } = require('../server');
const { authenticate, authorize } = require('../middleware/auth');
const IpifyService = require('../services/ipify');

/**
 * Rota para testar a conexão com a API ipify
 * Restrito a usuários com papel de admin ou técnico
 */
router.get('/ipify/test', authenticate, authorize(['admin', 'tecnico']), async (req, res) => {
  try {
    logger.info('Testando conexão com a API ipify');
    
    const isConnected = await IpifyService.testConnection();
    
    if (isConnected) {
      logger.info('Conexão com a API ipify estabelecida com sucesso');
      res.json({ status: 'success', message: 'Conexão com a API ipify estabelecida com sucesso' });
    } else {
      logger.warn('Falha ao conectar com a API ipify');
      res.status(503).json({ status: 'error', message: 'Falha ao conectar com a API ipify' });
    }
  } catch (error) {
    logger.error('Erro ao testar conexão com a API ipify:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao testar conexão com a API ipify', error: error.message });
  }
});

/**
 * Rota para obter o IP do cliente atual
 * Acessível a todos os usuários autenticados
 */
router.get('/ipify/client-ip', authenticate, async (req, res) => {
  try {
    logger.info('Obtendo IP do cliente');
    
    const ip = await IpifyService.getClientIp();
    
    if (ip) {
      logger.info('IP do cliente obtido com sucesso', { ip });
      res.json({ status: 'success', ip });
    } else {
      logger.warn('Falha ao obter o IP do cliente');
      res.status(503).json({ status: 'error', message: 'Falha ao obter o IP do cliente' });
    }
  } catch (error) {
    logger.error('Erro ao obter IP do cliente:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao obter IP do cliente', error: error.message });
  }
});

/**
 * Rota para obter informações geográficas de um IP
 * Restrito a usuários com papel de admin ou técnico
 */
router.get('/ipify/ip-info/:ip?', authenticate, authorize(['admin', 'tecnico']), async (req, res) => {
  try {
    const ip = req.params.ip || await IpifyService.getClientIp();
    
    if (!ip) {
      logger.warn('Falha ao obter o IP para consulta');
      return res.status(400).json({ status: 'error', message: 'IP não fornecido ou não foi possível obter o IP do cliente' });
    }
    
    logger.info('Obtendo informações geográficas do IP', { ip });
    
    const ipInfo = await IpifyService.getIpInfo(ip);
    
    if (ipInfo) {
      logger.info('Informações geográficas obtidas com sucesso', { ip });
      res.json({ status: 'success', ip, info: ipInfo });
    } else {
      logger.warn('Falha ao obter informações geográficas do IP', { ip });
      res.status(503).json({ status: 'error', message: 'Falha ao obter informações geográficas do IP' });
    }
  } catch (error) {
    logger.error('Erro ao obter informações geográficas do IP:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao obter informações geográficas do IP', error: error.message });
  }
});

module.exports = router;