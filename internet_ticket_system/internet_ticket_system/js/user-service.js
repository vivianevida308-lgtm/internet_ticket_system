/**
 * User Service - Gerencia operações relacionadas a usuários
 */

import ApiService from './api.js';

class UserService {
    /**
     * Obtém todos os usuários (apenas para admin)
     * @returns {Promise<Array>} - Lista de usuários
     */
    static async getAllUsers() {
        try {
            return await ApiService.get('/users');
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }
    
    /**
     * Obtém um usuário específico pelo ID
     * @param {string} userId - ID do usuário
     * @returns {Promise<object>} - Dados do usuário
     */
    static async getUserById(userId) {
        try {
            return await ApiService.get(`/users/${userId}`);
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Cria um novo usuário (apenas para admin)
     * @param {object} userData - Dados do usuário
     * @returns {Promise<object>} - Usuário criado
     */
    static async createUser(userData) {
        try {
            return await ApiService.post('/users', userData);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    
    /**
     * Atualiza um usuário existente (apenas para admin)
     * @param {string} userId - ID do usuário
     * @param {object} updateData - Dados a serem atualizados
     * @returns {Promise<object>} - Usuário atualizado
     */
    static async updateUser(userId, updateData) {
        try {
            return await ApiService.put(`/users/${userId}`, updateData);
        } catch (error) {
            console.error(`Error updating user ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Obtém o texto traduzido para o papel do usuário
     * @param {string} role - Papel do usuário
     * @returns {string} - Texto traduzido
     */
    static getRoleText(role) {
        const roleTexts = {
            'admin': 'Administrador',
            'technician': 'Técnico',
            'customer': 'Cliente',
            'tecnico': 'Técnico',
            'cliente': 'Cliente'
        };
        
        return roleTexts[role] || role;
    }
    
    /**
     * Obtém a classe CSS para o papel do usuário
     * @param {string} role - Papel do usuário
     * @returns {string} - Classe CSS
     */
    static getRoleClass(role) {
        const roleClasses = {
            'admin': 'bg-primary-100 text-primary-800',
            'technician': 'bg-info-100 text-info-800',
            'customer': 'bg-secondary-100 text-secondary-800',
            'tecnico': 'bg-info-100 text-info-800',
            'cliente': 'bg-secondary-100 text-secondary-800'
        };
        
        return roleClasses[role] || 'bg-secondary-100 text-secondary-800';
    }
    
    /**
     * Obtém a classe CSS para o status do usuário
     * @param {boolean} active - Status do usuário
     * @returns {string} - Classe CSS
     */
    static getStatusClass(active) {
        return active 
            ? 'bg-success-100 text-success-800' 
            : 'bg-error-100 text-error-800';
    }
    
    /**
     * Obtém o texto para o status do usuário
     * @param {boolean} active - Status do usuário
     * @returns {string} - Texto do status
     */
    static getStatusText(active) {
        return active ? 'Ativo' : 'Inativo';
    }
}

export default UserService;