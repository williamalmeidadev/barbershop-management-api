export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  duracao_minutos: number;
  preco_centavos: number;
  foto_url?: string | null;
  ativo: number;
}
