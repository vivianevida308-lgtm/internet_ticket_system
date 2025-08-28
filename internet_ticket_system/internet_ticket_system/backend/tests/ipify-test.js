/**
 * Script para testar a integração com a API externa ipify
 * 
 * Este script pode ser executado para verificar se a API ipify está funcionando corretamente
 * e se a integração com o sistema de tickets está configurada adequadamente.
 */

const IpifyService = require('../services/ipify');

// Função para testar a conexão com a API ipify
async function testIpifyConnection() {
  console.log('Testando conexão com a API ipify...');
  
  try {
    const isConnected = await IpifyService.testConnection();
    
    if (isConnected) {
      console.log('✅ Conexão com a API ipify estabelecida com sucesso!');
      return true;
    } else {
      console.error('❌ Falha ao conectar com a API ipify.');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar conexão com a API ipify:', error.message);
    return false;
  }
}

// Função para testar a obtenção do IP do cliente
async function testGetClientIp() {
  console.log('\nTestando obtenção do IP do cliente...');
  
  try {
    const ip = await IpifyService.getClientIp();
    
    if (ip) {
      console.log(`✅ IP obtido com sucesso: ${ip}`);
      return ip;
    } else {
      console.error('❌ Falha ao obter o IP do cliente.');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao obter IP do cliente:', error.message);
    return null;
  }
}

// Função para testar a obtenção de informações geográficas do IP
async function testGetIpInfo(ip) {
  if (!ip) {
    console.error('\n❌ Não é possível obter informações geográficas sem um IP válido.');
    return;
  }
  
  console.log(`\nTestando obtenção de informações geográficas para o IP ${ip}...`);
  
  try {
    const ipInfo = await IpifyService.getIpInfo(ip);
    
    if (ipInfo) {
      console.log('✅ Informações geográficas obtidas com sucesso:');
      console.log(JSON.stringify(ipInfo, null, 2));
    } else {
      console.error('❌ Falha ao obter informações geográficas do IP.');
    }
  } catch (error) {
    console.error('❌ Erro ao obter informações geográficas:', error.message);
  }
}

// Função principal para executar todos os testes
async function runAllTests() {
  console.log('=== TESTE DE INTEGRAÇÃO COM API IPIFY ===\n');
  
  const isConnected = await testIpifyConnection();
  
  if (isConnected) {
    const ip = await testGetClientIp();
    await testGetIpInfo(ip);
  }
  
  console.log('\n=== FIM DOS TESTES ===');
}

// Executar os testes
runAllTests().catch(error => {
  console.error('Erro ao executar testes:', error);
});