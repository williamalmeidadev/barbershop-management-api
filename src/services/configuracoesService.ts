import { configuracoesRepository } from '../repositories/configuracoesRepository'

export const configuracoesService = {
  async obterRegrasDesconto(): Promise<{ desconto_qtd_concluidos: number | null; desconto_valor_centavos: number | null }> {
    const [qtd, valor] = await Promise.all([
      configuracoesRepository.getInt('desconto_qtd_concluidos'),
      configuracoesRepository.getInt('desconto_valor_centavos')
    ])
    return { desconto_qtd_concluidos: qtd, desconto_valor_centavos: valor }
  },

  async atualizarRegrasDesconto(payload: { desconto_qtd_concluidos?: number; desconto_valor_centavos?: number }): Promise<void> {
    const { desconto_qtd_concluidos, desconto_valor_centavos } = payload

    if (desconto_qtd_concluidos === undefined && desconto_valor_centavos === undefined) {
      throw new Error('Informe ao menos um campo para atualizar.')
    }
    if (desconto_qtd_concluidos !== undefined && desconto_qtd_concluidos <= 0) {
      throw new Error('desconto_qtd_concluidos deve ser maior que 0.')
    }
    if (desconto_valor_centavos !== undefined && desconto_valor_centavos <= 0) {
      throw new Error('desconto_valor_centavos deve ser maior que 0.')
    }

    if (desconto_qtd_concluidos !== undefined) {
      await configuracoesRepository.setInt('desconto_qtd_concluidos', desconto_qtd_concluidos)
    }
    if (desconto_valor_centavos !== undefined) {
      await configuracoesRepository.setInt('desconto_valor_centavos', desconto_valor_centavos)
    }
  }
  ,
  async removerRegrasDesconto(): Promise<void> {
    await Promise.all([
      configuracoesRepository.delete('desconto_qtd_concluidos'),
      configuracoesRepository.delete('desconto_valor_centavos')
    ])
  }
}
