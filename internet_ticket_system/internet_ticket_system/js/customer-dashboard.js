/**
 * Customer Dashboard - Integração com o backend
 */

import TicketService from './ticket-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Verifica autenticação
    checkAuthentication();
    
    // Carrega dados do dashboard
    await loadDashboardData();
    
    // Configura eventos
    setupEventListeners();
});

/**
 * Verifica se o usuário está autenticado e tem permissão
 */
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (!isLoggedIn) {
        window.location.href = 'user_login.html';
        return;
    }
    
    // Verifica se o usuário tem permissão para acessar esta página
    if (userRole !== 'customer' && userRole !== 'admin') {
        // Redireciona para o dashboard apropriado
        if (userRole === 'technician') {
            window.location.href = 'technician_dashboard.html';
        } else {
            window.location.href = 'user_login.html';
        }
    }
    
    // Atualiza a interface com informações do usuário
    updateUserInterface();
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
 * Carrega dados do dashboard
 */
async function loadDashboardData() {
    try {
        // Mostra indicadores de carregamento
        showLoadingState(true);
        
        // Obtém tickets do usuário
        const tickets = await fetchUserTickets();
        
        // Atualiza contadores
        updateTicketCounters(tickets);
        
        // Atualiza lista de tickets recentes
        updateRecentTickets(tickets);
        
        // Esconde indicadores de carregamento
        showLoadingState(false);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showLoadingState(false);
        showErrorMessage('Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.');
        
        // Carrega dados de demonstração
        loadDemoData();
    }
}

/**
 * Obtém tickets do usuário atual
 */
async function fetchUserTickets() {
    try {
        // Tenta obter tickets da API
        const userId = localStorage.getItem('userId');
        const response = await fetch(`http://localhost:3000/api/tickets?userId=${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao obter tickets');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        throw error;
    }
}

/**
 * Atualiza contadores de tickets
 */
function updateTicketCounters(tickets) {
    if (!tickets || !Array.isArray(tickets)) return;
    
    // Contadores
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(ticket => ticket.status === 'aberto').length;
    const inProgressTickets = tickets.filter(ticket => ticket.status === 'em_andamento').length;
    const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolvido').length;
    
    // Atualiza elementos na interface
    document.getElementById('totalTicketsCount').textContent = totalTickets;
    document.getElementById('openTicketsCount').textContent = openTickets;
    document.getElementById('inProgressTicketsCount').textContent = inProgressTickets;
    document.getElementById('resolvedTicketsCount').textContent = resolvedTickets;
}

/**
 * Atualiza lista de tickets recentes
 */
function updateRecentTickets(tickets) {
    if (!tickets || !Array.isArray(tickets)) return;
    
    const recentTicketsList = document.getElementById('recentTicketsList');
    if (!recentTicketsList) return;
    
    // Limpa lista atual
    recentTicketsList.innerHTML = '';
    
    // Ordena tickets por data de criação (mais recentes primeiro)
    const sortedTickets = [...tickets].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Pega os 5 mais recentes
    const recentTickets = sortedTickets.slice(0, 5);
    
    if (recentTickets.length === 0) {
        recentTicketsList.innerHTML = `
            <div class="text-center py-6">
                <p class="text-text-secondary">Nenhum ticket encontrado.</p>
            </div>
        `;
        return;
    }
    
    // Adiciona tickets à lista
    recentTickets.forEach(ticket => {
        const ticketElement = createTicketElement(ticket);
        recentTicketsList.appendChild(ticketElement);
    });
}

/**
 * Cria elemento HTML para um ticket
 */
function createTicketElement(ticket) {
    const ticketElement = document.createElement('div');
    ticketElement.className = 'border-b border-secondary-200 last:border-0';
    
    // Formata data
    const createdAt = new Date(ticket.createdAt);
    const formattedDate = createdAt.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    // Define classes para status
    const statusClasses = {
        'aberto': 'bg-info-100 text-info-800',
        'em_andamento': 'bg-warning-100 text-warning-800',
        'resolvido': 'bg-success-100 text-success-800',
        'fechado': 'bg-secondary-100 text-secondary-800'
    };
    
    const statusText = {
        'aberto': 'Aberto',
        'em_andamento': 'Em Andamento',
        'resolvido': 'Resolvido',
        'fechado': 'Fechado'
    };
    
    ticketElement.innerHTML = `
        <a href="ticket_details.html?id=${ticket._id}" class="block p-4 hover:bg-secondary-50 transition-colors">
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-text-primary">${ticket.title}</h3>
                <span class="text-xs ${statusClasses[ticket.status] || 'bg-secondary-100'} px-2 py-1 rounded-full">
                    ${statusText[ticket.status] || ticket.status}
                </span>
            </div>
            <p class="text-sm text-text-secondary mb-2 line-clamp-2">${ticket.description}</p>
            <div class="flex items-center justify-between text-xs text-text-tertiary">
                <span>Ticket #${ticket.ticketNumber || ticket._id.substring(0, 8)}</span>
                <span>${formattedDate}</span>
            </div>
        </a>
    `;
    
    return ticketElement;
}

/**
 * Configura eventos
 */
function setupEventListeners() {
    // Botão de criar novo ticket
    const newTicketBtn = document.getElementById('newTicketBtn');
    if (newTicketBtn) {
        newTicketBtn.addEventListener('click', () => {
            window.location.href = 'create_ticket.html';
        });
    }
    
    // Botão de ver todos os tickets
    const viewAllTicketsBtn = document.getElementById('viewAllTicketsBtn');
    if (viewAllTicketsBtn) {
        viewAllTicketsBtn.addEventListener('click', () => {
            window.location.href = 'my_tickets.html';
        });
    }
    
    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
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
    }
    
    // Botão do menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavPanel = document.getElementById('mobileNavPanel');
    const closeMobileNav = document.getElementById('closeMobileNav');
    
    if (mobileMenuBtn && mobileNavOverlay && mobileNavPanel) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNavOverlay.classList.remove('hidden');
            setTimeout(() => {
                mobileNavPanel.classList.remove('-translate-x-full');
            }, 50);
        });
        
        if (closeMobileNav) {
            closeMobileNav.addEventListener('click', closeMobileMenu);
        }
        
        mobileNavOverlay.addEventListener('click', (e) => {
            if (e.target === mobileNavOverlay) {
                closeMobileMenu();
            }
        });
    }
    
    function closeMobileMenu() {
        mobileNavPanel.classList.add('-translate-x-full');
        setTimeout(() => {
            mobileNavOverlay.classList.add('hidden');
        }, 300);
    }
}

/**
 * Mostra/esconde indicadores de carregamento
 */
function showLoadingState(show) {
    const loadingIndicators = document.querySelectorAll('.loading-indicator');
    const contentElements = document.querySelectorAll('.content-element');
    
    loadingIndicators.forEach(element => {
        element.style.display = show ? 'flex' : 'none';
    });
    
    contentElements.forEach(element => {
        element.style.display = show ? 'none' : '';
    });
}

/**
 * Mostra mensagem de erro
 */
function showErrorMessage(message) {
    const errorAlert = document.getElementById('errorAlert');
    if (!errorAlert) return;
    
    errorAlert.textContent = message;
    errorAlert.classList.remove('hidden');
    
    setTimeout(() => {
        errorAlert.classList.add('hidden');
    }, 5000);
}

/**
 * Carrega dados de demonstração quando a API não está disponível
 */
function loadDemoData() {
    const demoTickets = [
        {
            _id: '60d21b4667d0d8992e610c85',
            title: 'Internet lenta após tempestade',
            description: 'Minha conexão está muito lenta desde a tempestade de ontem à noite. Velocidade de download abaixo de 5Mbps.',
            status: 'aberto',
            createdAt: '2023-06-15T14:30:00.000Z',
            ticketNumber: 'T1001'
        },
        {
            _id: '60d21b4667d0d8992e610c86',
            title: 'Roteador não liga',
            description: 'Meu roteador parou de funcionar completamente. As luzes não acendem mesmo após reiniciar.',
            status: 'em_andamento',
            createdAt: '2023-06-10T09:15:00.000Z',
            ticketNumber: 'T1002'
        },
        {
            _id: '60d21b4667d0d8992e610c87',
            title: 'Solicitação de aumento de velocidade',
            description: 'Gostaria de aumentar meu plano de internet de 100Mbps para 300Mbps.',
            status: 'resolvido',
            createdAt: '2023-06-05T16:45:00.000Z',
            ticketNumber: 'T1003'
        },
        {
            _id: '60d21b4667d0d8992e610c88',
            title: 'Problemas de conexão intermitente',
            description: 'Minha internet cai várias vezes ao dia por alguns minutos e depois volta.',
            status: 'aberto',
            createdAt: '2023-06-01T11:20:00.000Z',
            ticketNumber: 'T1004'
        },
        {
            _id: '60d21b4667d0d8992e610c89',
            title: 'Instalação de novo ponto de rede',
            description: 'Preciso de um ponto de rede adicional instalado no meu escritório em casa.',
            status: 'fechado',
            createdAt: '2023-05-25T13:10:00.000Z',
            ticketNumber: 'T1005'
        }
    ];
    
    // Atualiza contadores
    updateTicketCounters(demoTickets);
    
    // Atualiza lista de tickets recentes
    updateRecentTickets(demoTickets);
}