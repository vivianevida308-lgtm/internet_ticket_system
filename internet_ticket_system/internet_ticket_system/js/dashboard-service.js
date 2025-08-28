/**
 * Dashboard Service - Gerencia operações relacionadas ao dashboard
 */

import ApiService from './api.js';

class DashboardService {
    /**
     * Obtém métricas de tickets para o dashboard
     * @returns {Promise<object>} - Métricas de tickets
     */
    static async getTicketMetrics() {
        try {
            return await ApiService.get('/dashboard/tickets');
        } catch (error) {
            console.error('Error fetching ticket metrics:', error);
            throw error;
        }
    }
    
    /**
     * Obtém métricas de usuários para o dashboard
     * @returns {Promise<object>} - Métricas de usuários
     */
    static async getUserMetrics() {
        try {
            return await ApiService.get('/dashboard/users');
        } catch (error) {
            console.error('Error fetching user metrics:', error);
            throw error;
        }
    }
    
    /**
     * Obtém métricas de SLA para o dashboard
     * @returns {Promise<object>} - Métricas de SLA
     */
    static async getSLAMetrics() {
        try {
            return await ApiService.get('/dashboard/sla');
        } catch (error) {
            console.error('Error fetching SLA metrics:', error);
            throw error;
        }
    }
    
    /**
     * Obtém métricas de performance para o dashboard
     * @returns {Promise<object>} - Métricas de performance
     */
    static async getPerformanceMetrics() {
        try {
            return await ApiService.get('/dashboard/performance');
        } catch (error) {
            console.error('Error fetching performance metrics:', error);
            throw error;
        }
    }
    
    /**
     * Obtém todas as métricas para o dashboard
     * @returns {Promise<object>} - Todas as métricas
     */
    static async getAllMetrics() {
        try {
            const [tickets, users, sla, performance] = await Promise.all([
                this.getTicketMetrics(),
                this.getUserMetrics(),
                this.getSLAMetrics(),
                this.getPerformanceMetrics()
            ]);
            
            return {
                tickets,
                users,
                sla,
                performance
            };
        } catch (error) {
            console.error('Error fetching all metrics:', error);
            throw error;
        }
    }
    
    /**
     * Formata dados para gráficos
     * @param {Array} data - Dados a serem formatados
     * @param {string} labelKey - Chave para os rótulos
     * @param {string} valueKey - Chave para os valores
     * @returns {object} - Dados formatados para gráficos
     */
    static formatChartData(data, labelKey, valueKey) {
        return {
            labels: data.map(item => item[labelKey]),
            values: data.map(item => item[valueKey])
        };
    }
    
    /**
     * Gera cores aleatórias para gráficos
     * @param {number} count - Quantidade de cores
     * @returns {Array} - Array de cores em formato RGBA
     */
    static generateChartColors(count) {
        const colors = [];
        const baseColors = [
            [66, 133, 244],   // Azul
            [219, 68, 55],    // Vermelho
            [244, 180, 0],    // Amarelo
            [15, 157, 88],    // Verde
            [171, 71, 188],   // Roxo
            [255, 112, 67],   // Laranja
            [0, 188, 212],    // Ciano
            [124, 179, 66]    // Verde limão
        ];
        
        for (let i = 0; i < count; i++) {
            const colorIndex = i % baseColors.length;
            const [r, g, b] = baseColors[colorIndex];
            colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
        }
        
        return colors;
    }
}

export default DashboardService;