export enum SlotStatus {
  DISPONIVEL = 'DISPONIVEL',
  RESERVADO = 'RESERVADO',
  BLOQUEADO = 'BLOQUEADO',
}

export interface Slot {
  id: number;
  barbeiro_id: number;
  inicio: string; 
  fim: string;    
  status: SlotStatus;
}

export interface CreateSlotsParams {
  barbeiroId: number;
  data: string; 
  inicioExpediente: string;
  fimExpediente: string;    
  duracaoSlot: number;     
}
