export enum StatusVaga {
  DISPONIVEL = 'DISPONIVEL',
  RESERVADO = 'RESERVADO',
  BLOQUEADO = 'BLOQUEADO',
}

export interface Vaga {
  id: number;
  barbeiro_id: number;
  inicio: string;
  fim: string;
  status: StatusVaga;
  motivo_bloqueio?: string | null;
}

export interface CriarVagasParams {
  barbeiroId: number;
  data: string;
  inicioExpediente: string;
  fimExpediente: string;
  duracaoVaga: number;
}
