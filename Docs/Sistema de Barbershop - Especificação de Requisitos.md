

Este documento descreve os requisitos funcionais e não funcionais para o desenvolvimento da API de gerenciamento da barbearia.

## 1. Requisitos Funcionais (RF)

| ID | Nome | Descrição |
| :--- | :--- | :--- |
| **[RF001]** | **Autenticação de Usuários** | • O sistema deve permitir cadastro com nome, e-mail e senha.<br>• Autenticação via **Token JWT** (Stateless).<br>• Todas as rotas (exceto login/registro) requerem token + verificação de *role*.<br>• Validações: força de senha e e-mail único. |
| **[RF002]** | **Gestão Administrativa** | • O administrador cadastra, edita e exclui **Serviços** (nome, preço, tempo médio).<br>• Gerenciamento de usuários e níveis de acesso (*roles*).<br>• Vinculação de serviços aos profissionais responsáveis. |
| **[RF003]** | **Módulo do Cliente** | • Visualização de serviços disponíveis.<br>• Agendamento de atendimentos.<br>• Cancelamento de agendamento (respeitando regras de negócio).<br>• Visualização do valor total (soma dos serviços selecionados). |
| **[RF004]** | **Registro de Atendimento** | • O sistema deve armazenar: Serviços contratados + Profissional + Cliente.<br>• Deve permitir o cálculo automático do valor final e gerar histórico/relatório. |
| **[RF005]** | **Controle de Agendamentos** | O sistema de horários deve respeitar os seguintes status:<br>• **Disponível:** Horário livre para novos agendamentos.<br>• **Não Disponível:** Horário já ocupado ou bloqueado.<br>• **Agendado:** Status visualizado pelo cliente dono da reserva. |

## 2. Requisitos Não Funcionais (RNF)

| ID | Nome | Descrição |
| :--- | :--- | :--- |
| **[RNF001]** | **Acessibilidade do Agendamento** | Referente ao **[RF004]**: O sistema deve permitir fluxo de agendamento otimizado. |
| **[RNF002]** | **Segurança de Dados** | As senhas devem ser armazenadas com hash criptográfico (ex: bcrypt) e dados sensíveis devem ser protegidos. |
