# 💈 AlphaCuts - Barbershop Management System

O **AlphaCuts** é uma solução completa de gestão para barbearias e salões de beleza, integrando uma API REST robusta a um front-end intuitivo para otimizar o fluxo de agendamentos e fidelização de clientes.

---

## 🚀 Funcionalidades Principais

* **💳 Clube de Vantagens:** Sistema de benefícios para clientes fiéis.
* **📅 Atendimento Personalizado:** Agende serviços com seu barbeiro de preferência.
* **👔 Gestão para o Profissional:** Organização completa de agenda e carteira de clientes.
* **⚡ Simples e Rápido:** Interface focada na agilidade do dia a dia.

---

## 🛠️ Tecnologias e Ferramentas

### 💻 Frontend
* **HTML5 / CSS3 / JavaScript:** Construção da interface visual.

### ⚙️ Backend (API)
* **Node.js & TypeScript:** Ambiente de execução e tipagem estática.
* **Express:** Framework principal para rotas e requisições HTTP.
* **Multer:** Gerenciamento e upload de arquivos/imagens.
* **JWT (JSON Web Token):** Autenticação e segurança via tokens.
* **Bcrypt:** Criptografia e segurança de senhas.
* **SQLite3:** Banco de dados relacional leve e eficiente.

### 🧪 Testes e Qualidade
* **Mocha & Chai:** Suíte de testes unitários e de integração.
* **NYC:** Relatórios de cobertura de código (Coverage).

### 🔧 Ferramentas de Apoio
* **Google Stitch:** Prototipagem da solução.
* **GitHub Projects:** Organização ágil das tarefas.
* **Postman:** Validação e testes de rotas da API.
* **Discord:** Comunicação e colaboração remota.
* **Antigravity:** Plataforma utilizada para o desenvolvimento robusto.

---

## 📂 Estrutura de Arquivos (`src`)

A arquitetura do projeto é organizada para separação de responsabilidades:

* `controllers/`: Lógica de entrada e resposta das rotas.
* `services/`: Regras de negócio da aplicação.
* `middlewares/`: Filtros de autenticação (JWT) e validações.
* `repositories/`: Comunicação direta com o banco de dados.
* `database/`: Scripts de conexão e persistência.

---

## 📊 Modelagem do Banco de Dados

Utilizamos o **DBDesigner** para estruturar as relações entre Clientes, Barbeiros, Serviços e Agendamentos.



---

## ⚙️ Como Instalar e Rodar

### Pré-requisitos

* Node.js 18+ (recomendado: 20+)
* NPM 9+

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

Observações:

* `JWT_SECRET` é obrigatório para geração/validação de tokens.
* O admin inicial só é criado se `ADMIN_EMAIL` e `ADMIN_PASSWORD` estiverem definidos.
* A criação do admin ocorre no startup da aplicação e não duplica usuário já existente.

### 4) Rode a aplicação

Modo desenvolvimento:

```bash
npm run dev
```

Build + execução:

```bash
npm run build
npm start
```

### 5) (Opcional) Popular o banco com dados de exemplo

O projeto possui seed em `src/seed.ts` com clientes, admin, barbeiros, serviços, vagas e agendamentos:

```bash
npx ts-node src/seed.ts
```

Depois, acesse:

* App cliente: `http://localhost:3000/`
* Login admin: `http://localhost:3000/admin-login`

---

## 👥 Equipe de Desenvolvedores

Projeto realizado com a colaboração de:

* Caio José dos Santos Santana
* Davi Balsamão
* Esdras Estevão
* João Matheus Pereira Andrade
* José William Almeida
* Otávio Augusto Grotto

---

## 📄 Licença
Distribuído sob a licença **MIT**.
