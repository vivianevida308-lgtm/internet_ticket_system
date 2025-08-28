/**
 * API Service - Gerencia todas as chamadas para a API do backend
 */

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
    /**
     * Realiza uma requisição HTTP para a API
     * @param {string} endpoint - Endpoint da API
     * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
     * @param {object} data - Dados a serem enviados (opcional)
     * @param {boolean} requiresAuth - Se a requisição requer autenticação
     * @returns {Promise<any>} - Resposta da API
     */
    static async request(endpoint, method = 'GET', data = null, requiresAuth = true) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Adiciona o token de autenticação se necessário
        if (requiresAuth) {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Autenticação necessária. Por favor, faça login novamente.');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const options = {
            method,
            headers,
            credentials: 'include',
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            
            // Verifica se a resposta é JSON
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            
            // Processa a resposta
            const responseData = isJson ? await response.json() : await response.text();
            
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                // Se a resposta contém uma mensagem de erro, use-a
                const errorMessage = isJson && responseData.message 
                    ? responseData.message 
                    : 'Ocorreu um erro ao processar sua solicitação.';
                
                throw new Error(errorMessage);
            }
            
            return responseData;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }
    
    // Métodos auxiliares para diferentes tipos de requisições
    static async get(endpoint, requiresAuth = true) {
        return this.request(endpoint, 'GET', null, requiresAuth);
    }
    
    static async post(endpoint, data, requiresAuth = true) {
        return this.request(endpoint, 'POST', data, requiresAuth);
    }
    
    static async put(endpoint, data, requiresAuth = true) {
        return this.request(endpoint, 'PUT', data, requiresAuth);
    }
    
    static async delete(endpoint, requiresAuth = true) {
        return this.request(endpoint, 'DELETE', null, requiresAuth);
    }
}

export default ApiService;