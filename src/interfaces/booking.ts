export enum BookingStatus {
  AGENDADO = 'AGENDADO',
  CANCELADO = 'CANCELADO',
  CONCLUIDO = 'CONCLUIDO',
}

export interface Booking {
  id: number;
  cliente_id: number;
  barbeiro_id: number;
  inicio: string;
  fim: string;
  status: BookingStatus;
  valor_total_centavos: number;
  created_at: string;
  servicos: BookingService[];
  slots: number[];
}

export interface BookingService {
  servico_id: number;
  preco_centavos: number;
  duracao_minutos: number;
}

export interface CreateBookingPayload {
  cliente_id: number;
  barbeiro_id: number;
  servicos: number[]; // lista de IDs dos serviços
  inicio_desejado: string; // ISO string
}
