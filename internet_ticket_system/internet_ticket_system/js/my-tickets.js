/**
 * My Tickets - Integração com o backend
 */

import TicketService from './ticket-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Verifica autenticação
    checkAuthentication();
    
    // Carrega tickets
    await loadTickets();
    
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
 * Carrega tickets do usuário
 */
async function loadTickets() {
    try {
        // Mostra indicador de carregamento
        showLoadingState(true);
        
        // Obtém tickets do usuário
        const tickets = await fetchUserTickets();
        
        // Atualiza a tabela de tickets
        updateTicketsTable(tickets);
        
        // Esconde indicador de carregamento
        showLoadingState(false);
    } catch (error) {
        console.error('Error loading tickets:', error);
        showLoadingState(false);
        showErrorMessage('Não foi possível carregar seus tickets. Tente novamente mais tarde.');
        
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
 * Atualiza a tabela de tickets
 */
function updateTicketsTable(tickets) {
    const ticketsTableBody = document.getElementById('ticketsTableBody');
    if (!ticketsTableBody) return;
    
    // Limpa tabela atual
    ticketsTableBody.innerHTML = '';
    
    if (!tickets || tickets.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="5" class="py-4 text-center text-text-secondary">
                Nenhum ticket encontrado.
            </td>
        `;
        ticketsTableBody.appendChild(emptyRow);
        return;
    }
    
    // Adiciona tickets à tabela
    tickets.forEach(ticket => {
        const row = createTicketRow(ticket);
        ticketsTableBody.appendChild(row);
    });
}

/**
 * Cria uma linha da tabela para um ticket
 */
function createTicketRow(ticket) {
    const row = document.createElement('tr');
    row.className = 'hover:bg-secondary-50 transition-colors';
    
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
    
    // Define classes para prioridade
    const priorityClasses = {
        'baixa': 'bg-success-100 text-success-800',
        'media': 'bg-warning-100 text-warning-800',
        'alta': 'bg-error-100 text-error-800',
        'critica': 'bg-error-700 text-white'
    };
    
    const priorityText = {
        'baixa': 'Baixa',
        'media': 'Média',
        'alta': 'Alta',
        'critica': 'Crítica'
    };
    
    row.innerHTML = `
        <td class="py-3 px-4">
            <a href="ticket_details.html?id=${ticket._id}" class="text-primary hover:text-primary-700 font-medium">
                #${ticket.ticketNumber || ticket._id.substring(0, 8)}
            </a>
        </td>
        <td class="py-3 px-4">
            <div class="line-clamp-1">${ticket.title}</div>
        </td>
        <td class="py-3 px-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[ticket.status] || 'bg-secondary-100'}">
                ${statusText[ticket.status] || ticket.status}
            </span>
        </td>
        <td class="py-3 px-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClasses[ticket.priority] || 'bg-secondary-100'}">
                ${priorityText[ticket.priority] || ticket.priority}
            </span>
        </td>
        <td class="py-3 px-4 text-text-secondary">
            ${formattedDate}
        </td>
    `;
    
    return row;
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
    
    // Botão de filtro
    const filterBtn = document.getElementById('filterBtn');
    const filterDropdown = document.getElementById('filterDropdown');
    
    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', () => {
            filterDropdown.classList.toggle('hidden');
        });
        
        // Fecha dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
                filterDropdown.classList.add('hidden');
            }
        });
    }
    
    // Filtros de status
    const statusFilters = document.querySelectorAll('[data-status-filter]');
    statusFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const status = filter.getAttribute('data-status-filter');
            filterTicketsByStatus(status);
            
            // Atualiza texto do botão
            const filterBtnText = document.getElementById('filterBtnText');
            if (filterBtnText) {
                filterBtnText.textContent = status === 'all' ? 'Todos' : getStatusText(status);
            }
            
            // Fecha dropdown
            filterDropdown.classList.add('hidden');
        });
    });
    
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
 * Filtra tickets por status
 */
function filterTicketsByStatus(status) {
    const rows = document.querySelectorAll('#ticketsTableBody tr');
    
    if (status === 'all') {
        // Mostra todas as linhas
        rows.forEach(row => {
            row.classList.remove('hidden');
        });
        return;
    }
    
    // Filtra linhas por status
    rows.forEach(row => {
        const statusCell = row.querySelector('td:nth-child(3)');
        if (!statusCell) return;
        
        const statusText = statusCell.textContent.trim().toLowerCase();
        const match = getStatusFromText(statusText) === status;
        
        if (match) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
    
    // Verifica se há resultados visíveis
    const visibleRows = document.querySelectorAll('#ticketsTableBody tr:not(.hidden)');
    if (visibleRows.length === 0) {
        const ticketsTableBody = document.getElementById('ticketsTableBody');
        if (!ticketsTableBody) return;
        
        const emptyRow = document.createElement('tr');
        emptyRow.id = 'emptyFilterRow';
        emptyRow.innerHTML = `
            <td colspan="5" class="py-4 text-center text-text-secondary">
                Nenhum ticket encontrado com o filtro selecionado.
            </td>
        `;
        ticketsTableBody.appendChild(emptyRow);
    } else {
        const emptyFilterRow = document.getElementById('emptyFilterRow');
        if (emptyFilterRow) {
            emptyFilterRow.remove();
        }
    }
}

/**
 * Obtém o status a partir do texto exibido
 */
function getStatusFromText(text) {
    const statusMap = {
        'aberto': 'aberto',
        'em andamento': 'em_andamento',
        'resolvido': 'resolvido',
        'fechado': 'fechado'
    };
    
    return statusMap[text.toLowerCase()] || text;
}

/**
 * Obtém o texto traduzido para o status
 */
function getStatusText(status) {
    const statusTexts = {
        'aberto': 'Aberto',
        'em_andamento': 'Em Andamento',
        'resolvido': 'Resolvido',
        'fechado': 'Fechado'
    };
    
    return statusTexts[status] || status;
}

/**
 * Mostra/esconde indicador de carregamento
 */
function showLoadingState(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const ticketsTable = document.getElementById('ticketsTable');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }
    
    if (ticketsTable) {
        ticketsTable.style.display = show ? 'none' : 'table';
    }
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
            priority: 'media',
            createdAt: '2023-06-15T14:30:00.000Z',
            ticketNumber: 'T1001'
        },
        {
            _id: '60d21b4667d0d8992e610c86',
            title: 'Roteador não liga',
            description: 'Meu roteador parou de funcionar completamente. As luzes não acendem mesmo após reiniciar.',
            status: 'em_andamento',
            priority: 'alta',
            createdAt: '2023-06-10T09:15:00.000Z',
            ticketNumber: 'T1002'
        },
        {
            _id: '60d21b4667d0d8992e610c87',
            title: 'Solicitação de aumento de velocidade',
            description: 'Gostaria de aumentar meu plano de internet de 100Mbps para 300Mbps.',
            status: 'resolvido',
            priority: 'baixa',
            createdAt: '2023-06-05T16:45:00.000Z',
            ticketNumber: 'T1003'
        },
        {
            _id: '60d21b4667d0d8992e610c88',
            title: 'Problemas de conexão intermitente',
            description: 'Minha internet cai várias vezes ao dia por alguns minutos e depois volta.',
            status: 'aberto',
            priority: 'alta',
            createdAt: '2023-06-01T11:20:00.000Z',
            ticketNumber: 'T1004'
        },
        {
            _id: '60d21b4667d0d8992e610c89',
            title: 'Instalação de novo ponto de rede',
            description: 'Preciso de um ponto de rede adicional instalado no meu escritório em casa.',
            status: 'fechado',
            priority: 'media',
            createdAt: '2023-05-25T13:10:00.000Z',
            ticketNumber: 'T1005'
        }
    ];
    
    // Atualiza a tabela de tickets
    updateTicketsTable(demoTickets);
}