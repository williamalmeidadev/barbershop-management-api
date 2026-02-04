export enum StatusAgendamento {
  SOLICITADO = 'SOLICITADO',
  AGENDADO = 'AGENDADO',
  CANCELADO = 'CANCELADO',
  CONCLUIDO = 'CONCLUIDO',
  RECUSADO = 'RECUSADO',
}

export enum PagamentoTipo {
  DINHEIRO = 'DINHEIRO',
  PIX = 'PIX',
  CARTAO = 'CARTAO',
}

export interface Agendamento {
  id: number;
  cliente_id: number;
  cliente?: ClienteResumo;
  barbeiro_id: number;
  barbeiro?: BarbeiroResumo;
  inicio: string;
  fim: string;
  concluido_em?: string | null;
  pagamento_tipo?: PagamentoTipo | null;
  status: StatusAgendamento;
  valor_original_centavos: number;
  desconto_aplicado_centavos: number;
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

export interface BarbeiroResumo {
  id: number;
  nome_profissional: string;
  bio: string | null;
}

export interface ClienteResumo {
  id: number;
  nome: string;
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
