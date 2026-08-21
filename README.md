# 💈 AlphaCuts - Barbershop Management System

O **AlphaCuts** é uma solução completa de gestão para barbearias e salões de beleza, integrando uma API REST robusta a um front-end intuitivo para otimizar o fluxo de agendamentos e fidelização de clientes.

---

## 🛠️ Tecnologias e Ferramentas

### Frontend
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)

### Backend & Database
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

### Testes & Qualidade
![Mocha](https://img.shields.io/badge/-mocha-%238D6748?style=for-the-badge&logo=mocha&logoColor=white)
![Chai](https://img.shields.io/badge/chai-%23A30700.svg?style=for-the-badge&logo=chai&logoColor=white)

---

## 🏛️ Arquitetura do Sistema

O sistema é estruturado seguindo o padrão de **Camadas**, garantindo uma separação clara de responsabilidades, alta testabilidade e facilidade de manutenção.

```mermaid
graph TD
    Client[Cliente / Frontend] -->|HTTP Requests| Express[Roteador Express / Middlewares]
    Express -->|Controladores| Controller[Controllers]
    Controller -->|Regras de Negócio| Service[Services]
    Service -->|Operações CRUD & Queries| Repository[Repositories]
    Repository -->|Transações & Acesso a Dados| Transaction[Transaction Helper]
    Transaction -->|Leitura e Escrita| SQLite[(SQLite Database)]
```

### Camadas de Código (`src`)
*   **`routes/`**: Define os endpoints da API e mapeia as requisições HTTP para os controladores adequados.
*   **`middlewares/`**: Executa lógica intermediária de segurança, validações gerais e autenticação de tokens JWT.
*   **`controllers/`**: Recebe os parâmetros de entrada, formata as requisições e retorna as respostas HTTP.
*   **`services/`**: Centraliza toda a lógica de negócio do sistema (ex: regras de desconto, verificação de concorrência de horários/vagas).
*   **`repositories/`**: Abstrai as operações de persistência e comunicação direta com o banco de dados.
*   **`database/`**: Estabelece a conexão e cria as tabelas do banco SQLite.

---

## 🚀 Funcionalidades Principais

*   **💳 Clube de Vantagens:** Sistema de benefícios e cupons para clientes fiéis.
*   **📅 Atendimento Personalizado:** Agendamento rápido de serviços com o barbeiro preferido.
*   **👔 Gestão para o Profissional:** Gerenciamento completo de agenda e carteira de clientes para barbeiros e administradores.
*   **⚡ Segurança:** Validação de força de senha, envio de token para verificação de e-mail e controle de requisições por Rate Limiter.

---

## ⚙️ Como Instalar e Rodar

### Pré-requisitos
*   Node.js 18+ (recomendado: 20+)
*   NPM 9+

### 1) Clone o repositório
```bash
git clone https://github.com/williamalmeidadev/barbershop-management-api.git
cd barbershop-management-api
```

### 2) Instale as dependências
```bash
npm install
```

### 3) Configure o `.env`
Crie um arquivo `.env` na raiz do projeto:
```env
PORT=3000
JWT_SECRET=troque_por_uma_chave_forte

# Admin inicial (criado automaticamente ao iniciar a API, se não existir)
ADMIN_USUARIO=admin
ADMIN_NOME=Administrador
ADMIN_EMAIL=admin@alphacuts.com
ADMIN_PASSWORD=Admin@123
```

### 4) Rode a aplicação
Modo desenvolvimento:
```bash
npm run dev
```

Build + execução em produção:
```bash
npm run build
npm start
```

### 5) Popular o banco com dados de exemplo (Opcional)
```bash
npx ts-node src/seed.ts
```

Acesse a aplicação localmente nos links:
*   **App Cliente:** `http://localhost:3000/`
*   **Painel Administrativo:** `http://localhost:3000/admin-login`

---

## 👥 Equipe de Desenvolvedores

Projeto realizado com a colaboração de:
*   Caio José dos Santos Santana
*   Davi Balsamão
*   Esdras Estevão
*   João Matheus Pereira Andrade
*   José William Almeida
*   Otávio Augusto Grotto

---

## 📄 Licença
Distribuído sob a licença **MIT**.
