import { Vaga, StatusVaga } from '../interfaces/vaga'
import { vagasRepository } from '../repositories/vagasRepository'

export const vagasService = {
  async listarTodas(barbeiroId: number, data: string): Promise<Vaga[]> {
    if (!barbeiroId || !data) {
      throw new Error('barbeiroId e data são obrigatórios.')
    }
    return vagasRepository.buscarTodasPorBarbeiroEData(barbeiroId, data)
  },
  async apagarVagaComValidacao(vagaId: number): Promise<{ success: boolean; message: string; vaga?: Vaga }> {
    const existeAgendamento = await vagasRepository.verificarAgendamentoNaVaga(vagaId)
    if (existeAgendamento) {
      return { success: false, message: 'Não é possível apagar: existe agendamento ocupando esta vaga.' }
    }

    const vagas = await vagasRepository.buscarVagasPorIds([vagaId])
    const vaga = vagas[0]
    const apagado = await vagasRepository.apagarVaga(vagaId)
    if (apagado && vaga) {
      return { success: true, message: 'Vaga apagada com sucesso.', vaga }
    } else {
      return { success: false, message: 'Vaga não encontrada ou já apagada.' }
    }
  },
  async listarDisponiveis(barbeiroId: number, data: string): Promise<Vaga[]> {
    if (!barbeiroId || !data) {
      throw new Error('barbeiroId e data são obrigatórios.')
    }
    return vagasRepository.buscarDisponiveisPorBarbeiroEData(barbeiroId, data)
  },
  async gerarAgendaDoDia(barbeiroId: number, data: string, inicioExpediente: string, fimExpediente: string, duracaoVaga: number): Promise<Vaga[]> {
    // Validações
    if (!barbeiroId || !data || !inicioExpediente || !fimExpediente || !duracaoVaga) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (duracaoVaga <= 0) {
      throw new Error('A duração da vaga deve ser positiva.')
    }
    const [hIni, mIni] = inicioExpediente.split(':').map(Number)
    const [hFim, mFim] = fimExpediente.split(':').map(Number)
    if (hIni > hFim || (hIni === hFim && mIni >= mFim)) {
      throw new Error('O início do expediente deve ser antes do fim.')
    }
    return vagasRepository.criarVagasParaBarbeiro(barbeiroId, data, inicioExpediente, fimExpediente, duracaoVaga)
  },

  async buscarBlocoLivre(barbeiroId: number, horarioDesejado: string, duracaoMinutos: number): Promise<Vaga[] | null> {
    if (!barbeiroId || !horarioDesejado || !duracaoMinutos) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (duracaoMinutos <= 0) {
      throw new Error('A duração deve ser positiva.')
    }
    const vagas = await vagasRepository.buscarDisponiveisPorBarbeiroEData(barbeiroId, horarioDesejado.split('T')[0])
    const inicioDesejado = new Date(horarioDesejado)
    const vagasFiltradas = vagas.filter(s => new Date(s.inicio) >= inicioDesejado)
    let bloco: Vaga[] = []
    let soma = 0
    for (let i = 0; i < vagasFiltradas.length; i++) {
      if (bloco.length === 0) {
        bloco.push(vagasFiltradas[i])
        soma = getVagaDuration(vagasFiltradas[i])
      } else {
        const anterior = bloco[bloco.length - 1]
        if (anterior.fim === vagasFiltradas[i].inicio) {
          bloco.push(vagasFiltradas[i])
          soma += getVagaDuration(vagasFiltradas[i])
        } else {
          bloco = [vagasFiltradas[i]]
          soma = getVagaDuration(vagasFiltradas[i])
        }
      }
      if (soma >= duracaoMinutos) {
        return bloco
      }
    }
    return null
  },

  async reservarVagasParaAgendamento(barbeiroId: number, inicioDesejado: string, duracaoMinutos: number): Promise<Vaga[] | null> {
    // Validações
    if (!barbeiroId || !inicioDesejado || !duracaoMinutos) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (duracaoMinutos <= 0) {
      throw new Error('A duração deve ser positiva.')
    }
    // Início da transação
    const sqlite3 = require('sqlite3')
    const db = require('../database/sqlite').db
    return await new Promise<Slot[] | null>((resolve, reject) => {
      db.serialize(async () => {
        db.run('BEGIN TRANSACTION')
        try {
          const vagas = await vagasRepository.buscarDisponiveisPorBarbeiroEData(barbeiroId, inicioDesejado.split('T')[0])
          const inicio = new Date(inicioDesejado)
          const vagasFiltradas = vagas.filter(s => new Date(s.inicio) >= inicio)
          let bloco: Vaga[] = []
          let soma = 0
          for (let i = 0; i < vagasFiltradas.length; i++) {
            if (bloco.length === 0) {
              bloco.push(vagasFiltradas[i])
              soma = getVagaDuration(vagasFiltradas[i])
            } else {
              const anterior = bloco[bloco.length - 1]
              if (anterior.fim === vagasFiltradas[i].inicio) {
                bloco.push(vagasFiltradas[i])
                soma += getVagaDuration(vagasFiltradas[i])
              } else {
                if (soma > 0 && soma < duracaoMinutos) {
                  db.run('ROLLBACK')
                  return resolve(null)
                }
                bloco = [vagasFiltradas[i]]
                soma = getVagaDuration(vagasFiltradas[i])
              }
            }
            if (soma >= duracaoMinutos) {
              const ids = bloco.map(s => s.id)
              db.all(
                `SELECT id FROM vagas WHERE id IN (${ids.map(() => '?').join(',')}) AND status = 'DISPONIVEL'`,
                ids,
                async (err: any, rows: any[]) => {
                  if (err) {
                    db.run('ROLLBACK')
                    return reject(err)
                  }
                  if (rows.length !== ids.length) {
                    db.run('ROLLBACK')
                    return resolve(null)
                  }
                  await vagasRepository.atualizarStatusLote(ids, StatusVaga.RESERVADO)
                  db.run('COMMIT')
                  return resolve(bloco)
                }
              )
              return
            }
          }
          db.run('ROLLBACK')
          return resolve(null)
        } catch (err) {
          db.run('ROLLBACK')
          return reject(err)
        }
      })
        },
  },

  async bloquearHorario(barbeiroId: number, inicio: string, fim: string, motivo?: string): Promise<Vaga[]> {
    if (!barbeiroId || !inicio || !fim) {
      throw new Error('Todos os campos são obrigatórios.')
    }
    if (new Date(inicio) >= new Date(fim)) {
      throw new Error('O início deve ser antes do fim.')
    }
    return vagasRepository.bloquearIntervalo(barbeiroId, inicio, fim)
  },

  async liberarVagasDoAgendamento(vagaIds: number[]): Promise<Vaga[]> {
    return vagasRepository.liberarVagas(vagaIds)
  },
}

function getVagaDuration(vaga: Vaga): number {
  const inicio = new Date(vaga.inicio)
  const fim = new Date(vaga.fim)
  return (fim.getTime() - inicio.getTime()) / 60000
}
