# Sistema de Tickets para Problemas de Internet

Um sistema completo para registro e gerenciamento de tickets de problemas de internet, com frontend responsivo em HTML/Tailwind CSS e backend em Node.js/Express/MongoDB.

## 🚀 Funcionalidades

- **Autenticação de Usuários** - Login seguro com diferentes níveis de acesso (cliente, técnico, admin)
- **Dashboard Personalizado** - Visão geral de tickets e métricas relevantes para cada tipo de usuário
- **Gerenciamento de Tickets** - Criação, visualização, atualização e acompanhamento de tickets
- **Histórico de Tickets** - Registro completo de todas as interações e mudanças de status
- **Métricas de Negócio** - Indicadores de desempenho e estatísticas de atendimento
- **Observabilidade** - Integração com Dynatrace e Splunk para monitoramento
- **Design Responsivo** - Interface adaptável para desktop e dispositivos móveis

## 📋 Requisitos

### Frontend
- Navegador moderno com suporte a ES6+

### Backend
- Node.js 14+
- MongoDB 4+
- Docker (opcional)

## 🛠️ Instalação e Execução

### Frontend

1. Instale as dependências:
```bash
npm install
# ou
yarn install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

### Backend

1. Navegue até a pasta backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env` com suas variáveis de ambiente (veja o exemplo em `.env.example`)

4. Inicie o servidor:
```bash
npm start
```

### Usando Docker (Backend)

1. Construa a imagem:
```bash
docker build -t internet-ticket-system-backend ./backend
```

2. Execute o container:
```bash
docker run -p 3000:3000 --env-file ./backend/.env internet-ticket-system-backend
```

## 📁 Estrutura do Projeto

```
/
├── backend/               # Código do servidor Node.js
│   ├── config/           # Configurações
│   ├── middleware/       # Middleware Express
│   ├── models/           # Modelos de dados MongoDB
│   ├── routes/           # Rotas da API
│   ├── services/         # Serviços de negócio
│   ├── tests/            # Testes automatizados
│   ├── server.js         # Ponto de entrada da aplicação
│   └── Dockerfile        # Configuração para Docker
│
├── css/                  # Arquivos CSS
│   ├── main.css          # CSS compilado
│   └── tailwind.css      # Configuração Tailwind
│
├── js/                   # Arquivos JavaScript
│   ├── api.js            # Cliente da API
│   ├── auth-service.js   # Serviço de autenticação
│   ├── auth.js           # Lógica de autenticação
│   ├── create-ticket.js  # Criação de tickets
│   ├── customer-dashboard.js # Dashboard do cliente
│   ├── dashboard-service.js # Serviço de dashboard
│   ├── my-tickets.js     # Listagem de tickets
│   ├── ticket-details.js # Detalhes do ticket
│   ├── ticket-service.js # Serviço de tickets
│   └── user-service.js   # Serviço de usuários
│
├── pages/                # Páginas HTML
│   ├── admin_dashboard.html    # Dashboard do administrador
│   ├── create_ticket.html      # Criação de tickets
│   ├── customer_dashboard.html # Dashboard do cliente
│   ├── my_tickets.html         # Lista de tickets do usuário
│   ├── ticket_details.html     # Detalhes do ticket
│   ├── ticket_management.html  # Gerenciamento de tickets
│   └── user_login.html         # Página de login
│
├── public/               # Arquivos públicos
│   ├── favicon.ico       # Ícone do site
│   └── manifest.json     # Manifest para PWA
│
├── index.html            # Página inicial
├── package.json          # Dependências do projeto
└── tailwind.config.js    # Configuração do Tailwind CSS
```

## 🔄 Fluxo de Integração Frontend-Backend

1. **Autenticação**
   - O frontend envia credenciais para `/api/users/login`
   - O backend valida e retorna token JWT
   - O token é armazenado no localStorage para requisições subsequentes

2. **Dashboard**
   - Após login, o usuário é redirecionado para o dashboard correspondente ao seu perfil
   - O frontend solicita dados de métricas e tickets recentes via API
   - Os dados são exibidos em cards e gráficos interativos

3. **Listagem de Tickets**
   - O frontend solicita tickets do usuário via `/api/tickets`
   - Implementação de filtros, paginação e ordenação
   - Exibição em formato de lista com detalhes resumidos

4. **Detalhes do Ticket**
   - Ao clicar em um ticket, o frontend solicita detalhes completos via `/api/tickets/:id`
   - Exibição de histórico, comentários e status
   - Opções para atualizar status, prioridade e adicionar comentários

5. **Criação de Ticket**
   - Formulário para envio de novos tickets
   - Validação de campos no frontend antes do envio
   - Submissão para `/api/tickets` com dados do problema e usuário

## 📊 API Endpoints

### Tickets
- `GET /api/tickets` - Listar tickets (filtrados por usuário ou todos para admin)
- `GET /api/tickets/:id` - Obter ticket por ID
- `POST /api/tickets` - Criar novo ticket
- `PUT /api/tickets/:id` - Atualizar ticket
- `DELETE /api/tickets/:id` - Excluir ticket (soft delete)
- `GET /api/tickets/metrics/summary` - Obter métricas de tickets

### Usuários
- `GET /api/users` - Listar todos os usuários (admin)
- `GET /api/users/:id` - Obter usuário por ID
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/:id` - Atualizar usuário
- `POST /api/users/login` - Login de usuário

### Observabilidade
- `GET /metrics` - Métricas do Prometheus
- `GET /health` - Verificação de saúde da aplicação

## 🔍 Métricas de Negócio

1. **Métricas de Volume**
   - Número total de tickets
   - Tickets por categoria
   - Tickets por status

2. **Métricas de Tempo**
   - Tempo médio de resolução
   - Tempo médio de primeira resposta
   - Percentual de tickets resolvidos dentro do SLA

3. **Métricas de Qualidade**
   - Taxa de reabertura de tickets
   - Satisfação do cliente
   - Eficiência dos técnicos

## 🔒 Segurança

- Autenticação baseada em JWT
- Validação de entrada em todas as requisições
- Sanitização de dados para prevenir injeções
- Controle de acesso baseado em perfis de usuário

## 📱 Design Responsivo

O sistema foi desenvolvido com abordagem mobile-first utilizando Tailwind CSS:

- `sm`: 640px e acima
- `md`: 768px e acima
- `lg`: 1024px e acima
- `xl`: 1280px e acima
- `2xl`: 1536px e acima

## 🧪 Testes

```bash
# Executar testes do backend
cd backend
npm test
```

## 📝 Licença

Este projeto está licenciado sob a licença MIT.
