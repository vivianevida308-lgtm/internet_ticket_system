# Sistema de Tickets para Problemas de Internet - Backend

## Visão Geral

Este é o backend do Sistema de Tickets para registrar e gerenciar problemas de internet. O sistema foi desenvolvido utilizando Node.js, Express e MongoDB, com recursos de observabilidade integrados ao Dynatrace e Splunk. O backend fornece uma API RESTful que é consumida pelo frontend para fornecer uma experiência completa ao usuário.

## Funcionalidades

- API RESTful para gerenciamento de tickets
- Autenticação de usuários com JWT
- Controle de acesso baseado em perfis (cliente, técnico, admin)
- Integração com API externa (ipify) para captura de IP do cliente
- Métricas de observabilidade (CPU/Memória)
- Logs estruturados enviados para Splunk
- Métricas de negócio expostas via Prometheus
- Histórico completo de tickets e interações

## Requisitos

- Node.js 14+
- MongoDB 4+
- Docker (opcional)

## Instalação

### Instalação Local

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure o arquivo `.env` com suas variáveis de ambiente
4. Inicie o servidor:
   ```
   npm start
   ```

### Instalação com Docker

1. Construa a imagem:
   ```
   docker build -t internet-ticket-system-backend .
   ```
2. Execute o container:
   ```
   docker run -p 3000:3000 --env-file .env internet-ticket-system-backend
   ```

## Estrutura do Projeto

```
/backend
  /models        # Modelos de dados MongoDB
  /routes        # Rotas da API
  /middleware    # Middleware Express
  /config        # Configurações
  /logs          # Logs locais
  server.js      # Ponto de entrada da aplicação
  Dockerfile     # Configuração para Docker
```

## API Endpoints

### Tickets

- `GET /api/tickets` - Listar todos os tickets
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

## Testando a API Externa (ipify)

A API ipify é utilizada para capturar o endereço IP do cliente. Para testar:

1. Acesse https://api.ipify.org?format=json em um navegador
2. Verifique se o retorno é um JSON contendo seu IP público

## Procedimento em Caso de Falha

1. **Falha na API ipify**:
   - O sistema continuará funcionando sem o IP do cliente
   - Logs de erro serão registrados
   - Verificar conectividade com a internet

2. **Falha no MongoDB**:
   - O servidor não iniciará se não conseguir conectar ao MongoDB
   - Verificar se o MongoDB está em execução
   - Verificar configurações de conexão no arquivo `.env`

3. **Falha no Splunk ou Dynatrace**:
   - O sistema continuará funcionando sem enviar logs/métricas
   - Verificar tokens de API e URLs no arquivo `.env`

## Integração Frontend-Backend

O backend foi projetado para ser consumido pelo frontend através de uma API RESTful. A integração entre as duas camadas segue o seguinte fluxo:

1. **Autenticação**
   - O frontend envia credenciais para `/api/users/login`
   - O backend valida e retorna token JWT
   - O token é armazenado no localStorage para requisições subsequentes

2. **Autorização**
   - Todas as requisições protegidas incluem o token JWT no cabeçalho Authorization
   - O middleware de autenticação valida o token e extrai informações do usuário
   - O controle de acesso é aplicado com base no perfil do usuário

3. **Comunicação de Dados**
   - O frontend consome endpoints da API para obter e enviar dados
   - Respostas são formatadas em JSON com estrutura padronizada
   - Códigos de status HTTP são utilizados para indicar o resultado das operações

4. **Tratamento de Erros**
   - Erros são retornados com mensagens descritivas e códigos apropriados
   - O frontend implementa fallbacks para cenários de indisponibilidade da API
   - Logs detalhados são gerados para facilitar a depuração

## Quando Escalar para Outros Times

1. **Time de Infraestrutura**:
   - Problemas de conectividade com MongoDB
   - Problemas de desempenho do servidor
   - Necessidade de escalabilidade

2. **Time de Segurança**:
   - Suspeita de vulnerabilidades
   - Problemas de autenticação/autorização
   - Ataques detectados nos logs

3. **Time de Observabilidade**:
   - Problemas com integração Dynatrace/Splunk
   - Necessidade de novas métricas ou dashboards

## Métricas Relevantes para o Negócio

1. **Métricas de Volume**:
   - Número total de tickets
   - Tickets por categoria
   - Tickets por status

2. **Métricas de Tempo**:
   - Tempo médio de resolução
   - Tempo médio de primeira resposta
   - Percentual de tickets resolvidos dentro do SLA

3. **Métricas de Qualidade**:
   - Taxa de reabertura de tickets
   - Satisfação do cliente
   - Eficiência dos técnicos