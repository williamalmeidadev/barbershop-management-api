export interface Servico {
  id: number;
  barbeiro_id: number;
  nome: string;
  descricao: string;
  duracao_minutos: number;
  preco_centavos: number;
  foto_url?: string | null;
  ativo: number;
}
