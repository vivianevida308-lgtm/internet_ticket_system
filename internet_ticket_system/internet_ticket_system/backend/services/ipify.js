const axios = require('axios');
const { logger } = require('../server');

/**
 * Serviço para integração com a API ipify
 * Responsável por obter o endereço IP do cliente
 */
class IpifyService {
  /**
   * Obtém o endereço IP do cliente usando a API ipify
   * @returns {Promise<string|null>} O endereço IP ou null em caso de erro
   */
  static async getClientIp() {
    try {
      logger.info('Obtendo IP do cliente via ipify');
      const response = await axios.get('https://api.ipify.org?format=json', {
        timeout: 5000 // timeout de 5 segundos
      });
      
      logger.info('IP do cliente obtido com sucesso', { ip: response.data.ip });
      return response.data.ip;
    } catch (error) {
      logger.error('Erro ao obter IP do cliente via ipify', { 
        error: error.message,
        code: error.code,
        status: error.response?.status
      });
      return null;
    }
  }
  
  /**
   * Obtém informações geográficas do IP usando a API ip-api.com
   * @param {string} ip - O endereço IP para consulta
   * @returns {Promise<Object|null>} Informações geográficas ou null em caso de erro
   */
  static async getIpInfo(ip) {
    if (!ip) {
      logger.warn('Tentativa de obter informações de IP sem fornecer um IP');
      return null;
    }
    
    try {
      logger.info('Obtendo informações geográficas do IP', { ip });
      const response = await axios.get(`http://ip-api.com/json/${ip}`, {
        timeout: 5000 // timeout de 5 segundos
      });
      
      if (response.data.status === 'success') {
        logger.info('Informações geográficas obtidas com sucesso', { ip });
        return {
          country: response.data.country,
          region: response.data.regionName,
          city: response.data.city,
          isp: response.data.isp,
          lat: response.data.lat,
          lon: response.data.lon
        };
      } else {
        logger.warn('API retornou status de erro', { ip, status: response.data.status });
        return null;
      }
    } catch (error) {
      logger.error('Erro ao obter informações geográficas do IP', { 
        ip,
        error: error.message,
        code: error.code,
        status: error.response?.status
      });
      return null;
    }
  }
  
  /**
   * Testa a conexão com a API ipify
   * @returns {Promise<boolean>} true se a conexão for bem-sucedida, false caso contrário
   */
  static async testConnection() {
    try {
      const response = await axios.get('https://api.ipify.org?format=json', {
        timeout: 3000 // timeout de 3 segundos
      });
      
      return response.status === 200 && response.data.ip !== undefined;
    } catch (error) {
      logger.error('Teste de conexão com ipify falhou', { error: error.message });
      return false;
    }
  }
}

module.exports = IpifyService;