export enum StatusAgendamento {
  AGENDADO = 'AGENDADO',
  CANCELADO = 'CANCELADO',
  CONCLUIDO = 'CONCLUIDO',
}

export interface Agendamento {
  id: number;
  cliente_id: number;
  barbeiro_id: number;
  inicio: string;
  fim: string;
  concluido_em?: string | null;
  status: StatusAgendamento;
  valor_total_centavos: number;
  created_at: string;
  servicos: ServicoAgendamento[];
  vagas: VagaAgendamento[];
}

export interface VagaAgendamento {
  id: number;
  inicio: string;
  fim: string;
  status: string;
}

export interface ServicoAgendamento {
  servico_id: number;
  preco_centavos: number;
  duracao_minutos: number;
  nome: string;
  descricao: string | null;
}

export interface CriarAgendamentoPayload {
  cliente_id: number;
  barbeiro_id: number;
  servicos: number[]; // lista de IDs dos serviços
  inicio_desejado: string; // ISO string
}
