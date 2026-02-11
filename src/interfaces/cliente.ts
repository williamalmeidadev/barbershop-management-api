export interface Cliente {
  id: number
  nome: string
  email: string
  telefone: string | null
  ativo: number
  concluidos_count: number
  desconto_disponivel_centavos: number
  is_verified: number
  verification_token?: string | null
}

export interface ClienteCreatePayload {
  nome: string
  email: string
  telefone?: string
  password: string
}

export interface ClienteLoginPayload {
  email: string
  password: string
}

export interface ClienteUpdatePayload {
  nome?: string
  email?: string
  telefone?: string | null
  ativo?: number
}

export interface ClienteLoginRow {
  id: number
  email: string
  password_hash: string
  ativo: number
  is_verified: number
}

export interface ClienteResumo {
  id: number
  concluidos_count: number
  desconto_disponivel_centavos: number
}
