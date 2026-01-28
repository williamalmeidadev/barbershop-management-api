import { Slot, SlotStatus } from '../interfaces/slot'
import { db } from '../database/sqlite'

export const slotRepository = {
  // ...existing code...
  async verificarAgendamentoNoSlot(slotId: number): Promise<boolean> {
    return await new Promise<boolean>((resolve, reject) => {
      db.get(
        `SELECT 1 FROM agendamento_vagas WHERE vaga_id = ?`,
        [slotId],
        (err, row) => {
          if (err) return reject(err)
          resolve(!!row)
        }
      )
    })
  },

  async apagarSlot(slotId: number): Promise<boolean> {
    return await new Promise<boolean>((resolve, reject) => {
      db.run(
        `DELETE FROM vagas WHERE id = ?`,
        [slotId],
        function (err) {
          if (err) return reject(err)
          resolve(this.changes > 0)
        }
      )
    })
  },
  async findTodosByBarbeiroEData(barbeiroId: number, data: string): Promise<Slot[]> {
    const inicioDia = `${data}T00:00:00.000Z`
    const proximoDia = new Date(inicioDia)
    proximoDia.setUTCDate(proximoDia.getUTCDate() + 1)
    return await new Promise<Slot[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM vagas WHERE barbeiro_id = ? AND inicio >= ? AND inicio < ? ORDER BY inicio ASC`,
        [barbeiroId, inicioDia, proximoDia.toISOString()],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Slot[])
        }
      )
    })
  },

  async createSlotsForBarbeiro(barbeiroId: number, data: string, inicioExpediente: string, fimExpediente: string, duracaoSlot: number): Promise<Slot[]> {
    const slots: Slot[] = []
    // Parse data e horários como local
    const [ano, mes, dia] = data.split('-').map(Number)
    const [hIni, mIni] = inicioExpediente.split(':').map(Number)
    const [hFim, mFim] = fimExpediente.split(':').map(Number)
    const start = new Date(ano, mes - 1, dia, hIni, mIni)
    const end = new Date(ano, mes - 1, dia, hFim, mFim)
    let atual = new Date(start)
    while (atual < end) {
      const slotInicio = new Date(atual)
      const slotFim = new Date(atual)
      slotFim.setMinutes(slotFim.getMinutes() + duracaoSlot)
      if (slotFim > end) break
      const exists = await new Promise<boolean>((resolve, reject) => {
        db.get(
          `SELECT 1 FROM vagas WHERE barbeiro_id = ? AND inicio = ? AND fim = ?`,
          [barbeiroId, slotInicio.toISOString(), slotFim.toISOString()],
          (err, row) => {
            if (err) return reject(err)
            resolve(!!row)
          }
        )
      })
      if (!exists) {
        await new Promise<void>((resolve, reject) => {
          db.run(
            `INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES (?, ?, ?, 'DISPONIVEL')`,
            [barbeiroId, slotInicio.toISOString(), slotFim.toISOString()],
            err => {
              if (err) return reject(err)
              resolve()
            }
          )
        })
      }
      slots.push({
        id: 0,
        barbeiro_id: barbeiroId,
        inicio: slotInicio.toISOString(),
        fim: slotFim.toISOString(),
        status: SlotStatus.DISPONIVEL,
      })
      atual = slotFim
    }
    return this.findDisponiveisByBarbeiroEData(barbeiroId, data)
  },

  async findDisponiveisByBarbeiroEData(barbeiroId: number, data: string): Promise<Slot[]> {
    const inicioDia = `${data}T00:00:00.000Z`
    const proximoDia = new Date(inicioDia)
    proximoDia.setUTCDate(proximoDia.getUTCDate() + 1)
    return await new Promise<Slot[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM vagas WHERE barbeiro_id = ? AND inicio >= ? AND inicio < ? AND status = 'DISPONIVEL' ORDER BY inicio ASC`,
        [barbeiroId, inicioDia, proximoDia.toISOString()],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Slot[])
        }
      )
    })
  },

  async findSlotsConsecutivos(barbeiroId: number, inicio: string, quantidade: number): Promise<Slot[]> {
    return await new Promise<Slot[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM vagas WHERE barbeiro_id = ? AND inicio >= ? AND status = 'DISPONIVEL' ORDER BY inicio ASC LIMIT ?`,
        [barbeiroId, inicio, quantidade],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Slot[])
        }
      )
    })
  },

  async updateStatusLote(slotIds: number[], status: SlotStatus): Promise<void> {
    if (!slotIds.length) return
    await new Promise<void>((resolve, reject) => {
      const placeholders = slotIds.map(() => '?').join(',')
      db.run(
        `UPDATE vagas SET status = ? WHERE id IN (${placeholders})`,
        [status, ...slotIds],
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
  },

  async bloquearIntervalo(barbeiroId: number, inicio: string, fim: string): Promise<Slot[]> {
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE vagas SET status = 'BLOQUEADO' WHERE barbeiro_id = ? AND inicio >= ? AND fim <= ? AND status = 'DISPONIVEL'`,
        [barbeiroId, inicio, fim],
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
    return await new Promise<Slot[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM vagas WHERE barbeiro_id = ? AND inicio >= ? AND fim <= ? AND status = 'BLOQUEADO'`,
        [barbeiroId, inicio, fim],
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Slot[])
        }
      )
    })
  },

  async liberarSlots(slotIds: number[]): Promise<Slot[]> {
    if (!slotIds.length) return []
    await new Promise<void>((resolve, reject) => {
      const placeholders = slotIds.map(() => '?').join(',')
      db.run(
        `UPDATE vagas SET status = 'DISPONIVEL' WHERE id IN (${placeholders})`,
        slotIds,
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })
    return await new Promise<Slot[]>((resolve, reject) => {
      const placeholders = slotIds.map(() => '?').join(',')
      db.all(
        `SELECT * FROM vagas WHERE id IN (${placeholders})`,
        slotIds,
        (err, rows) => {
          if (err) return reject(err)
          resolve(rows as Slot[])
        }
      )
    })
  },
}
