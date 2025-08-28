/**
 * Ticket Details - Integração com o backend
 */

import TicketService from './ticket-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Verifica autenticação
    checkAuthentication();
    
    // Obtém ID do ticket da URL
    const ticketId = getTicketIdFromUrl();
    
    if (ticketId) {
        // Carrega detalhes do ticket
        await loadTicketDetails(ticketId);
        
        // Configura eventos
        setupEventListeners(ticketId);
    } else {
        showErrorMessage('ID do ticket não encontrado na URL');
        setTimeout(() => {
            window.location.href = 'my_tickets.html';
        }, 3000);
    }
});

/**
 * Verifica se o usuário está autenticado
 */
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
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
 * Obtém o ID do ticket da URL
 */
function getTicketIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Carrega detalhes do ticket
 */
async function loadTicketDetails(ticketId) {
    try {
        // Mostra indicador de carregamento
        showLoadingState(true);
        
        // Obtém detalhes do ticket
        const ticket = await fetchTicketDetails(ticketId);
        
        // Atualiza a interface com os detalhes do ticket
        updateTicketDetailsUI(ticket);
        
        // Carrega histórico do ticket
        await loadTicketHistory(ticketId);
        
        // Esconde indicador de carregamento
        showLoadingState(false);
    } catch (error) {
        console.error('Error loading ticket details:', error);
        showLoadingState(false);
        showErrorMessage('Não foi possível carregar os detalhes do ticket. Tente novamente mais tarde.');
        
        // Carrega dados de demonstração
        loadDemoData(ticketId);
    }
}

/**
 * Obtém detalhes do ticket
 */
async function fetchTicketDetails(ticketId) {
    try {
        // Tenta obter detalhes do ticket da API
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao obter detalhes do ticket');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching ticket details:', error);
        throw error;
    }
}

/**
 * Atualiza a interface com os detalhes do ticket
 */
function updateTicketDetailsUI(ticket) {
    // Atualiza título da página
    document.title = `Ticket #${ticket.ticketNumber || ticket._id.substring(0, 8)} - Sistema de Tickets`;
    
    // Atualiza número do ticket
    const ticketNumberElements = document.querySelectorAll('.ticket-number');
    ticketNumberElements.forEach(element => {
        element.textContent = `#${ticket.ticketNumber || ticket._id.substring(0, 8)}`;
    });
    
    // Atualiza título do ticket
    const ticketTitleElement = document.getElementById('ticketTitle');
    if (ticketTitleElement) {
        ticketTitleElement.textContent = ticket.title;
    }
    
    // Atualiza descrição do ticket
    const ticketDescriptionElement = document.getElementById('ticketDescription');
    if (ticketDescriptionElement) {
        ticketDescriptionElement.textContent = ticket.description;
    }
    
    // Atualiza status do ticket
    updateTicketStatus(ticket.status);
    
    // Atualiza prioridade do ticket
    updateTicketPriority(ticket.priority);
    
    // Atualiza data de criação
    const createdAtElement = document.getElementById('createdAt');
    if (createdAtElement && ticket.createdAt) {
        const createdAt = new Date(ticket.createdAt);
        createdAtElement.textContent = createdAt.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Atualiza última atualização
    const updatedAtElement = document.getElementById('updatedAt');
    if (updatedAtElement && ticket.updatedAt) {
        const updatedAt = new Date(ticket.updatedAt);
        updatedAtElement.textContent = updatedAt.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Atualiza categoria
    const categoryElement = document.getElementById('category');
    if (categoryElement) {
        categoryElement.textContent = ticket.category || 'Não especificada';
    }
    
    // Atualiza técnico responsável
    const technicianElement = document.getElementById('technician');
    if (technicianElement) {
        technicianElement.textContent = ticket.technician?.name || 'Não atribuído';
    }
    
    // Atualiza informações de SLA
    updateSLAInfo(ticket);
    
    // Atualiza informações de localização
    updateLocationInfo(ticket);
}

/**
 * Atualiza o status do ticket na interface
 */
function updateTicketStatus(status) {
    const statusElement = document.getElementById('status');
    if (!statusElement) return;
    
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
    
    // Remove classes anteriores
    statusElement.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    // Adiciona classes de acordo com o status
    statusElement.classList.add(...(statusClasses[status] || 'bg-secondary-100').split(' '));
    
    // Atualiza texto
    statusElement.textContent = statusText[status] || status;
    
    // Atualiza opções de status no dropdown
    const statusSelect = document.getElementById('statusSelect');
    if (statusSelect) {
        for (let i = 0; i < statusSelect.options.length; i++) {
            if (statusSelect.options[i].value === status) {
                statusSelect.selectedIndex = i;
                break;
            }
        }
    }
}

/**
 * Atualiza a prioridade do ticket na interface
 */
function updateTicketPriority(priority) {
    const priorityElement = document.getElementById('priority');
    if (!priorityElement) return;
    
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
    
    // Remove classes anteriores
    priorityElement.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    // Adiciona classes de acordo com a prioridade
    priorityElement.classList.add(...(priorityClasses[priority] || 'bg-secondary-100').split(' '));
    
    // Atualiza texto
    priorityElement.textContent = priorityText[priority] || priority;
    
    // Atualiza opções de prioridade no dropdown
    const prioritySelect = document.getElementById('prioritySelect');
    if (prioritySelect) {
        for (let i = 0; i < prioritySelect.options.length; i++) {
            if (prioritySelect.options[i].value === priority) {
                prioritySelect.selectedIndex = i;
                break;
            }
        }
    }
}

/**
 * Atualiza informações de SLA na interface
 */
function updateSLAInfo(ticket) {
    const slaStatusElement = document.getElementById('slaStatus');
    if (!slaStatusElement) return;
    
    if (ticket.sla) {
        const now = new Date();
        const deadline = new Date(ticket.sla.deadline);
        
        if (ticket.status === 'resolvido' || ticket.status === 'fechado') {
            // Ticket já resolvido
            const resolvedAt = new Date(ticket.resolvedAt || ticket.updatedAt);
            const withinSLA = resolvedAt <= deadline;
            
            if (withinSLA) {
                slaStatusElement.innerHTML = `<span class="text-success-600">Resolvido dentro do SLA</span>`;
            } else {
                slaStatusElement.innerHTML = `<span class="text-error-600">Resolvido fora do SLA</span>`;
            }
        } else {
            // Ticket ainda aberto
            const timeRemaining = deadline - now;
            
            if (timeRemaining > 0) {
                // Dentro do prazo
                const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                
                slaStatusElement.innerHTML = `<span class="text-info-600">${hoursRemaining}h ${minutesRemaining}min restantes</span>`;
            } else {
                // Prazo expirado
                const hoursLate = Math.floor(Math.abs(timeRemaining) / (1000 * 60 * 60));
                const minutesLate = Math.floor((Math.abs(timeRemaining) % (1000 * 60 * 60)) / (1000 * 60));
                
                slaStatusElement.innerHTML = `<span class="text-error-600">${hoursLate}h ${minutesLate}min atrasado</span>`;
            }
        }
    } else {
        slaStatusElement.textContent = 'SLA não definido';
    }
}

/**
 * Atualiza informações de localização na interface
 */
function updateLocationInfo(ticket) {
    const locationElement = document.getElementById('location');
    if (!locationElement) return;
    
    if (ticket.ipInfo) {
        const { city, region, country } = ticket.ipInfo;
        locationElement.textContent = `${city || ''}, ${region || ''}, ${country || ''}`;
    } else {
        locationElement.textContent = 'Localização não disponível';
    }
}

/**
 * Carrega histórico do ticket
 */
async function loadTicketHistory(ticketId) {
    try {
        // Tenta obter histórico do ticket da API
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/history`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao obter histórico do ticket');
        }
        
        const history = await response.json();
        
        // Atualiza a interface com o histórico
        updateHistoryUI(history);
    } catch (error) {
        console.error('Error loading ticket history:', error);
        // Carrega histórico de demonstração
        loadDemoHistory();
    }
}

/**
 * Atualiza a interface com o histórico do ticket
 */
function updateHistoryUI(history) {
    const historyContainer = document.getElementById('historyContainer');
    if (!historyContainer) return;
    
    // Limpa conteúdo atual
    historyContainer.innerHTML = '';
    
    if (!history || history.length === 0) {
        historyContainer.innerHTML = `
            <div class="text-center py-4 text-text-secondary">
                Nenhum histórico disponível para este ticket.
            </div>
        `;
        return;
    }
    
    // Adiciona itens do histórico
    history.forEach(item => {
        const historyItem = createHistoryItem(item);
        historyContainer.appendChild(historyItem);
    });
}

/**
 * Cria um item de histórico
 */
function createHistoryItem(item) {
    const historyItem = document.createElement('div');
    historyItem.className = 'border-l-2 border-secondary-300 pl-4 pb-6 relative';
    
    // Adiciona marcador
    const marker = document.createElement('div');
    marker.className = 'absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white';
    historyItem.appendChild(marker);
    
    // Formata data
    const timestamp = new Date(item.timestamp);
    const formattedDate = timestamp.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Conteúdo do item
    const content = document.createElement('div');
    content.className = 'ml-2';
    
    // Cabeçalho com autor e data
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between mb-2';
    
    const author = document.createElement('span');
    author.className = 'font-medium text-text-primary';
    author.textContent = item.user?.name || 'Sistema';
    
    const date = document.createElement('span');
    date.className = 'text-sm text-text-secondary';
    date.textContent = formattedDate;
    
    header.appendChild(author);
    header.appendChild(date);
    content.appendChild(header);
    
    // Descrição da ação
    const description = document.createElement('p');
    description.className = 'text-text-secondary';
    description.textContent = getHistoryDescription(item);
    content.appendChild(description);
    
    // Comentário (se houver)
    if (item.comment) {
        const comment = document.createElement('div');
        comment.className = 'mt-2 p-3 bg-secondary-50 rounded-lg text-sm';
        comment.textContent = item.comment;
        content.appendChild(comment);
    }
    
    historyItem.appendChild(content);
    return historyItem;
}

/**
 * Obtém descrição para um item de histórico
 */
function getHistoryDescription(item) {
    switch (item.action) {
        case 'created':
            return 'Ticket criado';
        case 'status_updated':
            return `Status alterado para "${getStatusText(item.newValue)}"`;
        case 'priority_updated':
            return `Prioridade alterada para "${getPriorityText(item.newValue)}"`;
        case 'comment_added':
            return 'Comentário adicionado';
        case 'assigned':
            return `Atribuído para ${item.newValue}`;
        case 'resolved':
            return 'Ticket resolvido';
        case 'closed':
            return 'Ticket fechado';
        case 'reopened':
            return 'Ticket reaberto';
        default:
            return `${item.action}: ${item.oldValue || ''} → ${item.newValue || ''}`;
    }
}

/**
 * Obtém texto traduzido para o status
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
 * Obtém texto traduzido para a prioridade
 */
function getPriorityText(priority) {
    const priorityTexts = {
        'baixa': 'Baixa',
        'media': 'Média',
        'alta': 'Alta',
        'critica': 'Crítica'
    };
    
    return priorityTexts[priority] || priority;
}

/**
 * Configura eventos
 */
function setupEventListeners(ticketId) {
    // Formulário de comentário
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addComment(ticketId);
        });
    }
    
    // Botão de atualizar status
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', async () => {
            const statusSelect = document.getElementById('statusSelect');
            if (statusSelect) {
                await updateTicketStatus(ticketId, statusSelect.value);
            }
        });
    }
    
    // Botão de atualizar prioridade
    const updatePriorityBtn = document.getElementById('updatePriorityBtn');
    if (updatePriorityBtn) {
        updatePriorityBtn.addEventListener('click', async () => {
            const prioritySelect = document.getElementById('prioritySelect');
            if (prioritySelect) {
                await updateTicketPriority(ticketId, prioritySelect.value);
            }
        });
    }
    
    // Botão de voltar
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
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
 * Adiciona um comentário ao ticket
 */
async function addComment(ticketId) {
    const commentInput = document.getElementById('commentInput');
    if (!commentInput || !commentInput.value.trim()) {
        showErrorMessage('Por favor, digite um comentário.');
        return;
    }
    
    const comment = commentInput.value.trim();
    
    try {
        // Mostra indicador de carregamento
        const submitButton = document.querySelector('#commentForm button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
            `;
        }
        
        // Envia comentário para a API
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ comment })
        });
        
        if (!response.ok) {
            throw new Error('Falha ao adicionar comentário');
        }
        
        // Limpa campo de comentário
        commentInput.value = '';
        
        // Recarrega histórico do ticket
        await loadTicketHistory(ticketId);
        
        // Restaura botão
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Enviar';
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        showErrorMessage('Não foi possível adicionar o comentário. Tente novamente mais tarde.');
        
        // Restaura botão
        const submitButton = document.querySelector('#commentForm button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Enviar';
        }
    }
}

/**
 * Atualiza o status do ticket
 */
async function updateTicketStatus(ticketId, status) {
    try {
        // Mostra indicador de carregamento
        const updateButton = document.getElementById('updateStatusBtn');
        if (updateButton) {
            updateButton.disabled = true;
            updateButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Atualizando...
            `;
        }
        
        // Envia atualização para a API
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error('Falha ao atualizar status');
        }
        
        // Atualiza interface
        updateTicketStatus(status);
        
        // Recarrega histórico do ticket
        await loadTicketHistory(ticketId);
        
        // Restaura botão
        if (updateButton) {
            updateButton.disabled = false;
            updateButton.innerHTML = 'Atualizar';
        }
        
        // Mostra mensagem de sucesso
        showSuccessMessage('Status atualizado com sucesso!');
    } catch (error) {
        console.error('Error updating ticket status:', error);
        showErrorMessage('Não foi possível atualizar o status. Tente novamente mais tarde.');
        
        // Restaura botão
        const updateButton = document.getElementById('updateStatusBtn');
        if (updateButton) {
            updateButton.disabled = false;
            updateButton.innerHTML = 'Atualizar';
        }
    }
}

/**
 * Atualiza a prioridade do ticket
 */
async function updateTicketPriority(ticketId, priority) {
    try {
        // Mostra indicador de carregamento
        const updateButton = document.getElementById('updatePriorityBtn');
        if (updateButton) {
            updateButton.disabled = true;
            updateButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Atualizando...
            `;
        }
        
        // Envia atualização para a API
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ priority })
        });
        
        if (!response.ok) {
            throw new Error('Falha ao atualizar prioridade');
        }
        
        // Atualiza interface
        updateTicketPriority(priority);
        
        // Recarrega histórico do ticket
        await loadTicketHistory(ticketId);
        
        // Restaura botão
        if (updateButton) {
            updateButton.disabled = false;
            updateButton.innerHTML = 'Atualizar';
        }
        
        // Mostra mensagem de sucesso
        showSuccessMessage('Prioridade atualizada com sucesso!');
    } catch (error) {
        console.error('Error updating ticket priority:', error);
        showErrorMessage('Não foi possível atualizar a prioridade. Tente novamente mais tarde.');
        
        // Restaura botão
        const updateButton = document.getElementById('updatePriorityBtn');
        if (updateButton) {
            updateButton.disabled = false;
            updateButton.innerHTML = 'Atualizar';
        }
    }
}

/**
 * Mostra/esconde indicador de carregamento
 */
function showLoadingState(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const ticketDetails = document.getElementById('ticketDetails');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }
    
    if (ticketDetails) {
        ticketDetails.style.display = show ? 'none' : 'block';
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
 * Mostra mensagem de sucesso
 */
function showSuccessMessage(message) {
    const successAlert = document.getElementById('successAlert');
    if (!successAlert) return;
    
    successAlert.textContent = message;
    successAlert.classList.remove('hidden');
    
    setTimeout(() => {
        successAlert.classList.add('hidden');
    }, 5000);
}

/**
 * Carrega dados de demonstração quando a API não está disponível
 */
function loadDemoData(ticketId) {
    const demoTicket = {
        _id: ticketId || '60d21b4667d0d8992e610c85',
        ticketNumber: 'T1001',
        title: 'Internet lenta após tempestade',
        description: 'Minha conexão está muito lenta desde a tempestade de ontem à noite. Velocidade de download abaixo de 5Mbps. Já reiniciei o modem várias vezes mas o problema persiste. Preciso de internet para trabalhar remotamente.',
        status: 'em_andamento',
        priority: 'alta',
        category: 'Problemas de Conexão',
        createdAt: '2023-06-15T14:30:00.000Z',
        updatedAt: '2023-06-16T09:45:00.000Z',
        userId: '507f1f77bcf86cd799439011',
        technician: {
            _id: '507f1f77bcf86cd799439022',
            name: 'Maria Santos'
        },
        sla: {
            priority: 'alta',
            responseTime: 4,
            resolutionTime: 24,
            deadline: '2023-06-16T14:30:00.000Z'
        },
        ipInfo: {
            ip: '187.122.45.67',
            city: 'São Paulo',
            region: 'SP',
            country: 'Brasil'
        }
    };
    
    // Atualiza a interface com os detalhes do ticket
    updateTicketDetailsUI(demoTicket);
    
    // Carrega histórico de demonstração
    loadDemoHistory();
}

/**
 * Carrega histórico de demonstração
 */
function loadDemoHistory() {
    const demoHistory = [
        {
            _id: '60d21b4667d0d8992e610c90',
            ticketId: '60d21b4667d0d8992e610c85',
            action: 'created',
            timestamp: '2023-06-15T14:30:00.000Z',
            user: {
                _id: '507f1f77bcf86cd799439011',
                name: 'João Silva'
            }
        },
        {
            _id: '60d21b4667d0d8992e610c91',
            ticketId: '60d21b4667d0d8992e610c85',
            action: 'assigned',
            oldValue: null,
            newValue: 'Maria Santos',
            timestamp: '2023-06-15T15:10:00.000Z',
            user: {
                _id: '507f1f77bcf86cd799439033',
                name: 'Sistema'
            }
        },
        {
            _id: '60d21b4667d0d8992e610c92',
            ticketId: '60d21b4667d0d8992e610c85',
            action: 'status_updated',
            oldValue: 'aberto',
            newValue: 'em_andamento',
            timestamp: '2023-06-15T15:15:00.000Z',
            user: {
                _id: '507f1f77bcf86cd799439022',
                name: 'Maria Santos'
            }
        },
        {
            _id: '60d21b4667d0d8992e610c93',
            ticketId: '60d21b4667d0d8992e610c85',
            action: 'comment_added',
            timestamp: '2023-06-15T15:20:00.000Z',
            comment: 'Estou verificando o problema. Já realizei testes iniciais e identificamos uma possível instabilidade na sua região. Continuarei monitorando.',
            user: {
                _id: '507f1f77bcf86cd799439022',
                name: 'Maria Santos'
            }
        },
        {
            _id: '60d21b4667d0d8992e610c94',
            ticketId: '60d21b4667d0d8992e610c85',
            action: 'priority_updated',
            oldValue: 'media',
            newValue: 'alta',
            timestamp: '2023-06-16T09:45:00.000Z',
            user: {
                _id: '507f1f77bcf86cd799439022',
                name: 'Maria Santos'
            }
        },
        {
            _id: '60d21b4667d0d8992e610c95',
            ticketId: '60d21b4667d0d8992e610c85',
            action: 'comment_added',
            timestamp: '2023-06-16T09:50:00.000Z',
            comment: 'Aumentei a prioridade do seu caso devido à necessidade de trabalho remoto. Uma equipe técnica será enviada hoje entre 14h e 16h para verificar sua conexão. Por favor, confirme se estará em casa neste horário.',
            user: {
                _id: '507f1f77bcf86cd799439022',
                name: 'Maria Santos'
            }
        }
    ];
    
    // Atualiza a interface com o histórico
    updateHistoryUI(demoHistory);
}