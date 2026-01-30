export interface Barbeiro {
  id: number;
  nome_profissional: string;
  bio?: string | null;
  foto_url?: string | null;
  ativo: number;
}

export interface CriarBarbeiroPayload {
  nome_profissional: string;
  bio?: string | null;
  foto_url?: string | null;
  ativo?: number;
}

export interface AtualizarBarbeiroPayload {
  nome_profissional?: string;
  bio?: string | null;
  foto_url?: string | null;
  ativo?: number;
}
