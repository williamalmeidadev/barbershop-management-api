import { db } from '../database/sqlite'

export interface ClienteResumo {
  id: number
  concluidos_count: number
  desconto_disponivel_centavos: number
}

export const clientesRepository = {
  async buscarResumo(id: number): Promise<ClienteResumo | null> {
    return await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, concluidos_count, desconto_disponivel_centavos FROM clientes WHERE id = ?',
        [id],
        (err, row) => {
          if (err) return reject(err)
          resolve((row as ClienteResumo) ?? null)
        }
      )
    })
  },

  async atualizarContagemEDesconto(id: number, concluidosCount: number, descontoDisponivel?: number | null): Promise<void> {
    const fields = ['concluidos_count = ?']
    const values: any[] = [concluidosCount]

    if (descontoDisponivel !== undefined) {
      fields.push('desconto_disponivel_centavos = ?')
      values.push(descontoDisponivel)
    }

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) return reject(err)
          if (this.changes === 0) return reject(new Error('Cliente não encontrado.'))
          resolve()
        }
      )
    })
  },
}
