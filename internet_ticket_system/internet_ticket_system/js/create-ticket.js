/**
 * Create Ticket - Integração com o backend
 */

document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    checkAuthentication();
    
    // Configura eventos
    setupEventListeners();
    
    // Inicializa formulário
    initializeForm();
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
 * Inicializa o formulário
 */
function initializeForm() {
    // Preenche campos de usuário
    const userNameField = document.getElementById('userName');
    if (userNameField) {
        userNameField.value = localStorage.getItem('userName') || '';
    }
    
    const userEmailField = document.getElementById('userEmail');
    if (userEmailField) {
        userEmailField.value = localStorage.getItem('userEmail') || '';
    }
    
    // Preenche dropdown de categorias
    populateCategoriesDropdown();
}

/**
 * Preenche o dropdown de categorias
 */
function populateCategoriesDropdown() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;
    
    const categories = [
        { value: 'conexao', label: 'Problemas de Conexão' },
        { value: 'velocidade', label: 'Velocidade de Internet' },
        { value: 'equipamento', label: 'Problemas com Equipamento' },
        { value: 'cobranca', label: 'Faturamento e Cobrança' },
        { value: 'instalacao', label: 'Instalação e Configuração' },
        { value: 'outros', label: 'Outros' }
    ];
    
    // Limpa opções existentes
    categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    // Adiciona novas opções
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.value;
        option.textContent = category.label;
        categorySelect.appendChild(option);
    });
}

/**
 * Configura eventos
 */
function setupEventListeners() {
    // Formulário de criação de ticket
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', handleTicketSubmit);
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
    
    // Contador de caracteres para descrição
    const descriptionField = document.getElementById('description');
    const charCounter = document.getElementById('charCounter');
    
    if (descriptionField && charCounter) {
        descriptionField.addEventListener('input', () => {
            const remainingChars = 1000 - descriptionField.value.length;
            charCounter.textContent = `${remainingChars} caracteres restantes`;
            
            if (remainingChars < 0) {
                charCounter.classList.add('text-error-600');
                charCounter.classList.remove('text-text-secondary');
            } else {
                charCounter.classList.remove('text-error-600');
                charCounter.classList.add('text-text-secondary');
            }
        });
    }
}

/**
 * Manipula o envio do formulário de ticket
 */
async function handleTicketSubmit(e) {
    e.preventDefault();
    
    // Valida formulário
    if (!validateForm()) {
        return;
    }
    
    // Obtém dados do formulário
    const formData = getFormData();
    
    try {
        // Mostra indicador de carregamento
        showLoadingState(true);
        
        // Envia ticket para a API
        const response = await createTicket(formData);
        
        // Esconde indicador de carregamento
        showLoadingState(false);
        
        // Mostra mensagem de sucesso
        showSuccessMessage('Ticket criado com sucesso!');
        
        // Redireciona para a página de detalhes do ticket após 2 segundos
        setTimeout(() => {
            window.location.href = `ticket_details.html?id=${response._id}`;
        }, 2000);
    } catch (error) {
        console.error('Error creating ticket:', error);
        showLoadingState(false);
        showErrorMessage('Não foi possível criar o ticket. Tente novamente mais tarde.');
    }
}

/**
 * Valida o formulário
 */
function validateForm() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    
    let isValid = true;
    
    // Valida título
    if (!title) {
        showFieldError('title', 'O título é obrigatório');
        isValid = false;
    } else {
        clearFieldError('title');
    }
    
    // Valida descrição
    if (!description) {
        showFieldError('description', 'A descrição é obrigatória');
        isValid = false;
    } else if (description.length > 1000) {
        showFieldError('description', 'A descrição não pode ter mais de 1000 caracteres');
        isValid = false;
    } else {
        clearFieldError('description');
    }
    
    // Valida categoria
    if (!category) {
        showFieldError('category', 'Selecione uma categoria');
        isValid = false;
    } else {
        clearFieldError('category');
    }
    
    return isValid;
}

/**
 * Mostra erro de campo
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);
    
    if (field) {
        field.classList.add('border-error-500');
        field.classList.remove('border-secondary-300');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

/**
 * Limpa erro de campo
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);
    
    if (field) {
        field.classList.remove('border-error-500');
        field.classList.add('border-secondary-300');
    }
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }
}

/**
 * Obtém dados do formulário
 */
function getFormData() {
    return {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value,
        priority: document.getElementById('priority').value || 'media',
        userId: localStorage.getItem('userId')
    };
}

/**
 * Cria um novo ticket
 */
async function createTicket(ticketData) {
    try {
        // Tenta criar ticket na API
        const response = await fetch('http://localhost:3000/api/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(ticketData)
        });
        
        if (!response.ok) {
            throw new Error('Falha ao criar ticket');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
    }
}

/**
 * Mostra/esconde indicador de carregamento
 */
function showLoadingState(show) {
    const submitButton = document.querySelector('#ticketForm button[type="submit"]');
    
    if (submitButton) {
        if (show) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
            `;
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Criar Ticket';
        }
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