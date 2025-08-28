/**
 * Auth Service - Gerencia autenticação e autorização de usuários
 */

import ApiService from './api.js';

class AuthService {
    /**
     * Realiza o login do usuário
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<object>} - Dados do usuário autenticado
     */
    static async login(email, password) {
        try {
            const response = await ApiService.post('/users/login', { email, password }, false);
            
            if (response && response.token) {
                // Armazena o token e informações do usuário
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('userRole', response.user.role);
                localStorage.setItem('userEmail', response.user.email);
                localStorage.setItem('userId', response.user._id);
                localStorage.setItem('userName', response.user.name);
                localStorage.setItem('isLoggedIn', 'true');
                
                return response.user;
            } else {
                throw new Error('Resposta de login inválida');
            }
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }
    
    /**
     * Realiza o logout do usuário
     */
    static logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('isLoggedIn');
        
        // Redireciona para a página de login
        window.location.href = '../pages/user_login.html';
    }
    
    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} - True se o usuário estiver autenticado
     */
    static isAuthenticated() {
        return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('authToken') !== null;
    }
    
    /**
     * Obtém o papel (role) do usuário atual
     * @returns {string|null} - Papel do usuário ou null se não estiver autenticado
     */
    static getUserRole() {
        return localStorage.getItem('userRole');
    }
    
    /**
     * Obtém o ID do usuário atual
     * @returns {string|null} - ID do usuário ou null se não estiver autenticado
     */
    static getUserId() {
        return localStorage.getItem('userId');
    }
    
    /**
     * Obtém o nome do usuário atual
     * @returns {string|null} - Nome do usuário ou null se não estiver autenticado
     */
    static getUserName() {
        return localStorage.getItem('userName');
    }
    
    /**
     * Obtém o email do usuário atual
     * @returns {string|null} - Email do usuário ou null se não estiver autenticado
     */
    static getUserEmail() {
        return localStorage.getItem('userEmail');
    }
    
    /**
     * Verifica se o usuário tem permissão para acessar um recurso
     * @param {string[]} allowedRoles - Papéis permitidos
     * @returns {boolean} - True se o usuário tiver permissão
     */
    static hasPermission(allowedRoles) {
        const userRole = this.getUserRole();
        return userRole && allowedRoles.includes(userRole);
    }
    
    /**
     * Protege uma página, redirecionando para login se não autenticado
     * @param {string[]} allowedRoles - Papéis permitidos (opcional)
     */
    static protectPage(allowedRoles = null) {
        if (!this.isAuthenticated()) {
            window.location.href = '../pages/user_login.html';
            return;
        }
        
        if (allowedRoles && !this.hasPermission(allowedRoles)) {
            // Redireciona para uma página de acesso negado ou dashboard apropriado
            const userRole = this.getUserRole();
            if (userRole === 'admin') {
                window.location.href = '../pages/admin_dashboard.html';
            } else if (userRole === 'technician') {
                window.location.href = '../pages/technician_dashboard.html';
            } else {
                window.location.href = '../pages/customer_dashboard.html';
            }
        }
    }
}

export default AuthService;