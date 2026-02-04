export interface Admin {
  id: number
  usuario: string
  nome: string
  email: string | null
  ativo: number
}

export interface AdminCreatePayload {
  usuario: string
  nome: string
  email?: string
  password: string
}

export interface AdminLoginPayload {
  email: string
  password: string
}

export interface AdminLoginRow {
  id: number
  email: string
  password_hash: string
  ativo: number
}
