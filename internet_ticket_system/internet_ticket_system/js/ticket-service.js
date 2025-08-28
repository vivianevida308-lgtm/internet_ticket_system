/**
 * Ticket Service - Gerencia operações relacionadas a tickets
 */

import ApiService from './api.js';

class TicketService {
    /**
     * Obtém todos os tickets do usuário atual
     * @returns {Promise<Array>} - Lista de tickets
     */
    static async getUserTickets() {
        try {
            return await ApiService.get('/tickets');
        } catch (error) {
            console.error('Error fetching user tickets:', error);
            throw error;
        }
    }
    
    /**
     * Obtém todos os tickets (apenas para admin e técnicos)
     * @returns {Promise<Array>} - Lista de tickets
     */
    static async getAllTickets() {
        try {
            return await ApiService.get('/tickets');
        } catch (error) {
            console.error('Error fetching all tickets:', error);
            throw error;
        }
    }
    
    /**
     * Obtém um ticket específico pelo ID
     * @param {string} ticketId - ID do ticket
     * @returns {Promise<object>} - Dados do ticket
     */
    static async getTicketById(ticketId) {
        try {
            return await ApiService.get(`/tickets/${ticketId}`);
        } catch (error) {
            console.error(`Error fetching ticket ${ticketId}:`, error);
            throw error;
        }
    }
    
    /**
     * Cria um novo ticket
     * @param {object} ticketData - Dados do ticket
     * @returns {Promise<object>} - Ticket criado
     */
    static async createTicket(ticketData) {
        try {
            return await ApiService.post('/tickets', ticketData);
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
    }
    
    /**
     * Atualiza um ticket existente
     * @param {string} ticketId - ID do ticket
     * @param {object} updateData - Dados a serem atualizados
     * @returns {Promise<object>} - Ticket atualizado
     */
    static async updateTicket(ticketId, updateData) {
        try {
            return await ApiService.put(`/tickets/${ticketId}`, updateData);
        } catch (error) {
            console.error(`Error updating ticket ${ticketId}:`, error);
            throw error;
        }
    }
    
    /**
     * Exclui um ticket (soft delete)
     * @param {string} ticketId - ID do ticket
     * @returns {Promise<object>} - Resposta da API
     */
    static async deleteTicket(ticketId) {
        try {
            return await ApiService.delete(`/tickets/${ticketId}`);
        } catch (error) {
            console.error(`Error deleting ticket ${ticketId}:`, error);
            throw error;
        }
    }
    
    /**
     * Obtém métricas de tickets
     * @returns {Promise<object>} - Métricas de tickets
     */
    static async getTicketMetrics() {
        try {
            return await ApiService.get('/tickets/metrics');
        } catch (error) {
            console.error('Error fetching ticket metrics:', error);
            throw error;
        }
    }
    
    /**
     * Formata a data para exibição
     * @param {string} dateString - String de data ISO
     * @returns {string} - Data formatada
     */
    static formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Obtém a classe CSS para o status do ticket
     * @param {string} status - Status do ticket
     * @returns {string} - Classe CSS
     */
    static getStatusClass(status) {
        const statusClasses = {
            'aberto': 'bg-info-100 text-info-800',
            'em_andamento': 'bg-warning-100 text-warning-800',
            'resolvido': 'bg-success-100 text-success-800',
            'fechado': 'bg-secondary-100 text-secondary-800'
        };
        
        return statusClasses[status] || 'bg-secondary-100 text-secondary-800';
    }
    
    /**
     * Obtém o texto traduzido para o status do ticket
     * @param {string} status - Status do ticket
     * @returns {string} - Texto traduzido
     */
    static getStatusText(status) {
        const statusTexts = {
            'aberto': 'Aberto',
            'em_andamento': 'Em Andamento',
            'resolvido': 'Resolvido',
            'fechado': 'Fechado'
        };
        
        return statusTexts[status] || status;
    }
    
    /**
     * Obtém a classe CSS para a prioridade do ticket
     * @param {string} priority - Prioridade do ticket
     * @returns {string} - Classe CSS
     */
    static getPriorityClass(priority) {
        const priorityClasses = {
            'baixa': 'bg-success-100 text-success-800',
            'media': 'bg-warning-100 text-warning-800',
            'alta': 'bg-error-100 text-error-800',
            'critica': 'bg-error-700 text-white'
        };
        
        return priorityClasses[priority] || 'bg-secondary-100 text-secondary-800';
    }
    
    /**
     * Obtém o texto traduzido para a prioridade do ticket
     * @param {string} priority - Prioridade do ticket
     * @returns {string} - Texto traduzido
     */
    static getPriorityText(priority) {
        const priorityTexts = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta',
            'critica': 'Crítica'
        };
        
        return priorityTexts[priority] || priority;
    }
}

export default TicketService;