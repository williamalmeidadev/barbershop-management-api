# Regras de Negócio - Barbearia API

Este documento descreve as regras de negócio identificadas a partir da análise da camada de serviços (`src/services`).

## 1. Módulo de Agendamentos

### 1.1. Criação de Agendamento (`criarAgendamento`)
- **Obrigatoriedade**: `cliente_id`, `barbeiro_id`, `inicio_desejado` e `servicos` são obrigatórios.
- **Validação de Serviços**:
  - A lista `servicos` deve conter pelo menos um ID.
  - Todos os serviços devem existir, estar ativos e pertencer ao `barbeiro_id` informado.
- **Datas e Horários**:
  - `inicio_desejado` deve estar no formato ISO 8601 com timezone.
  - Não pode ser no passado (validado via regras de vaga).
- **Cálculo de Preço e Duração**:
  - A duração total é a soma da `duracao_minutos` de todos os serviços. Deve ser > 0.
  - O valor total é a soma dos `preco_centavos`.
- **Descontos**:
  - Verifica o `desconto_disponivel_centavos` acumulado do cliente.
  - O desconto aplicado é o menor valor entre: valor total do serviço e saldo de desconto do cliente.
  - O saldo do cliente é consumido imediatamente na reserva? (Código sugere atualização apenas na conclusão, mas a lógica de criação calcula o `valorComDesconto`).
- **Vagas (Slots)**:
  - O sistema busca vagas contíguas disponíveis (`vagasService.selecionarVagasParaAgendamento`) para o barbeiro e data/hora solicitada que comportem a duração total.
  - Se não houver slots suficientes e contíguos, o agendamento falha.
- **Estados Iniciais**:
  - O agendamento é criado com status `SOLICITADO` (REQUESTED).
  - Vagas e Serviços são associados ao agendamento no banco.

### 1.2. Fluxo de Vida do Agendamento
- **Cancelamento (`cancelarAgendamento`)**:
  - Pode ser feito pelo próprio cliente (dono do agendamento) ou por um Admin.
  - Não permitido se status for `CANCELADO`, `RECUSADO` ou `CONCLUIDO`.
  - Libera as vagas associadas (tornando-as disponíveis novamente).
  - Status final: `CANCELADO`.

- **Aceite (`aceitarAgendamento`)**:
  - Apenas Admin.
  - Apenas agendamentos com status `SOLICITADO`.
  - Verifica novamente se as vagas continuam disponíveis.
  - Reserva as vagas efetivamente (`StatusVaga.RESERVADO`).
  - Status final: `AGENDADO`.

- **Recusa (`recusarAgendamento`)**:
  - Apenas Admin.
  - Apenas agendamentos com status `SOLICITADO`.
  - Status final: `RECUSADO`.

- **Conclusão (`concluirAgendamento`)**:
  - Apenas Admin.
  - Status permitido: Deve ser `AGENDADO`.
  - **Pagamento**: `pagamento_tipo` é obrigatório e deve ser um dos tipos válidos (`DINHEIRO`, `CARTAO`, `PIX`).
  - **Data de Conclusão**: Usa o data/hora atual do servidor.
  - **Liberação de Vagas Ociosas**:
    - Se o serviço for concluído *antes* do horário final previsto, as vagas futuras (que ainda não aconteceram) associadas àquele agendamento são liberadas para novos agendamentos.
  - **Fidelidade e Recompensa**:
    - Incrementa o contador de agendamentos concluídos do cliente (`concluidos_count`).
    - Verifica regras globais de desconto (`desconto_qtd_concluidos`, `desconto_valor_centavos`).
    - Se `(novo_contador % qtd_regras == 0)` E `(cliente não tem desconto acumulado)`, o cliente ganha um novo crédito de desconto no valor configurado.

## 2. Módulo de Vagas (Slots)

### 2.1. Gestão de Disponibilidade
- **Criação de Agenda (`gerarAgendaDoDia`)**:
  - Cria slots de tamanho fixo (`duracaoVaga`) entre `inicioExpediente` e `fimExpediente`.
  - Valida consistência de horários (Início < Fim).
- **Busca de Blocos**:
  - Permite buscar blocos de tempo livre contíguos que somem determinada duração (`buscarBlocoLivre`).
- **Estados da Vaga**:
  - Disponível: Livre para alocação.
  - Reservado: Bloqueada para um agendamento confirmado (`AGENDADO`).

### 2.2. Restrições
- **Apagar Vaga**: Não é permitido apagar uma vaga se houver agendamento vinculado a ela.
- **Bloqueio**: Permite bloquear intervalo de horário (ex: almoço, folga), impedindo agendamentos.

## 3. Módulo de Serviços

- **Cadastro**:
  - Exige Nome, Duração (> 0) e Preço (>= 0).
  - Vinculado a um Barbeiro específico.
  - Pode ter Foto e Descrição opcionais.
- **Status**:
  - Pode ser Ativo (1) ou Inativo (0). Serviço inativo não deve ser listado para agendamento.

## 4. Módulo de Barbeiros

- **Cadastro**:
  - Exige `nome_profissional`.
  - Pode ter Bio e Foto.
  - Pode ser Ativo ou Inativo.

## 5. Módulo de Clientes e Autenticação

### 5.1. Clientes
- **Cadastro**:
  - Email único.
  - Senha encriptada (bcrypt).
  - Campos: Nome, Email, Telefone.
- **Login**:
  - Via Email/Senha.
  - Bloqueia login se usuário estiver inativo (`ativo === 0`).
  - Retorna JWT Token.

### 5.2. Admins
- **Cadastro**:
  - Validação de unicidade para Usuário e Email (se informado).
  - Senha encriptada.
- **Login**:
  - Via Email/Senha.
  - Bloqueia inativos.
  - Retorna JWT Token com role 'admin'.

## 6. Configurações Globais (Fidelidade)

- O sistema mantém configurações globais para regras de desconto automático:
  - `desconto_qtd_concluidos`: A cada quantos serviços o cliente ganha desconto.
  - `desconto_valor_centavos`: Qual o valor do desconto ganho.
