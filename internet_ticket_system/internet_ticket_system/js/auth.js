/**
 * Auth Module - Implementa a autenticação no frontend
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos na página de login
    const isLoginPage = window.location.pathname.includes('user_login.html');
    
    if (isLoginPage) {
        setupLoginForm();
    } else {
        // Verifica autenticação em outras páginas
        checkAuthentication();
    }
    
    // Configura botões de logout
    setupLogoutButtons();
});

/**
 * Configura o formulário de login
 */
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Limpa erros anteriores
        clearErrors();
        
        // Valida campos
        if (!email) {
            showError('emailError', 'Por favor, digite seu e-mail ou usuário.');
            return;
        }
        
        if (!password) {
            showError('passwordError', 'Por favor, digite sua senha.');
            return;
        }
        
        // Mostra estado de carregamento
        showLoading(true);
        
        try {
            // Tenta fazer login na API
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
                // Login bem-sucedido
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userId', data.user._id);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('isLoggedIn', 'true');
                
                // Redireciona para o dashboard apropriado
                redirectToDashboard(data.user.role);
            } else {
                // Erro de login
                showError('passwordError', data.message || 'E-mail ou senha incorretos. Tente novamente.');
                showLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('passwordError', 'Erro ao conectar ao servidor. Tente novamente mais tarde.');
            showLoading(false);
            
            // Fallback para o modo de demonstração
            useDemoLogin(email, password);
        }
    });
}

/**
 * Fallback para o modo de demonstração quando a API não está disponível
 */
function useDemoLogin(email, password) {
    // Demo credentials
    const demoCredentials = {
        'cliente@exemplo.com': { password: 'cliente123', role: 'customer', redirect: 'customer_dashboard.html' },
        'admin@exemplo.com': { password: 'admin123', role: 'admin', redirect: 'admin_dashboard.html' },
        'tecnico@exemplo.com': { password: 'tecnico123', role: 'technician', redirect: 'technician_dashboard.html' }
    };
    
    setTimeout(() => {
        const user = demoCredentials[email];
        
        if (user && user.password === password) {
            // Success - redirect to appropriate dashboard
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isLoggedIn', 'true');
            
            window.location.href = user.redirect;
        } else {
            // Error
            showError('passwordError', 'E-mail ou senha incorretos. Tente novamente.');
            showLoading(false);
        }
    }, 1000);
}

/**
 * Redireciona para o dashboard apropriado com base no papel do usuário
 */
function redirectToDashboard(role) {
    switch (role) {
        case 'admin':
            window.location.href = 'admin_dashboard.html';
            break;
        case 'technician':
            window.location.href = 'technician_dashboard.html';
            break;
        case 'customer':
        default:
            window.location.href = 'customer_dashboard.html';
            break;
    }
}

/**
 * Verifica se o usuário está autenticado
 */
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPath = window.location.pathname;
    
    // Se não estiver logado e não estiver na página de login, redireciona para login
    if (!isLoggedIn && !currentPath.includes('user_login.html')) {
        window.location.href = 'user_login.html';
        return;
    }
    
    // Se estiver logado, atualiza a interface com informações do usuário
    if (isLoggedIn) {
        updateUserInterface();
    }
}

/**
 * Atualiza a interface com informações do usuário
 */
function updateUserInterface() {
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    // Atualiza elementos da interface com o email do usuário
    const userEmailElements = document.querySelectorAll('#userEmail');
    userEmailElements.forEach(element => {
        element.textContent = userEmail || userName || 'Usuário';
    });
}

/**
 * Configura botões de logout
 */
function setupLogoutButtons() {
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    
    logoutButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Limpa dados de autenticação
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('isLoggedIn');
            
            // Redireciona para a página de login
            window.location.href = 'user_login.html';
        });
    });
}

/**
 * Mostra estado de carregamento no botão de login
 */
function showLoading(show) {
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginButton = document.getElementById('loginButton');
    
    if (!loginText || !loginSpinner || !loginButton) return;
    
    if (show) {
        loginText.classList.add('hidden');
        loginSpinner.classList.remove('hidden');
        loginButton.disabled = true;
    } else {
        loginText.classList.remove('hidden');
        loginSpinner.classList.add('hidden');
        loginButton.disabled = false;
    }
}

/**
 * Mostra mensagem de erro
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

/**
 * Limpa mensagens de erro
 */
function clearErrors() {
    const errorElements = document.querySelectorAll('[id$="Error"]');
    errorElements.forEach(element => {
        element.classList.add('hidden');
        element.textContent = '';
    });
}