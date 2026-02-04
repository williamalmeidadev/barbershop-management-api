import { Request, Response } from 'express'
import { vagasService } from '../services/vagasService'
import { servicoService } from '../services/servicosService'

export const slotController = {
  async apagarSlot(req: Request, res: Response) {
    try {
      const { vagaId } = req.body
      if (!vagaId) return res.status(400).json({ error: 'vagaId é obrigatório.' })
      const result = await vagasService.apagarVagaComValidacao(vagaId)
      if (result.success) {
        return res.status(200).json({ message: 'Vaga apagada com sucesso.', vaga: result.vaga })
      } else {
        return res.status(409).json({ error: result.message })
      }
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },
  async listarTodos(req: Request, res: Response) {
    try {
      const { barbeiroId, data } = req.query
      const vagas = await vagasService.listarTodas(Number(barbeiroId), String(data))
      res.json(vagas)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },
  async gerarAgendaDoDia(req: Request, res: Response) {
    try {
      const { barbeiroId, data, inicioExpediente, fimExpediente, duracaoSlot } = req.body
      const vagas = await vagasService.gerarAgendaDoDia(barbeiroId, data, inicioExpediente, fimExpediente, duracaoSlot)
      res.status(201).json(vagas)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },


  async listarDisponibilidadeServicos(req: Request, res: Response) {
    try {
      const { barbeiroId, data, servicosIds } = req.query

      if (!barbeiroId || !data || !servicosIds) {
        return res.status(400).json({ error: 'barbeiroId, data e servicosIds são obrigatórios.' })
      }

      // Parse servicosIds (expecting string "1,2,3" or array)
      let ids: number[] = []
      if (Array.isArray(servicosIds)) {
        ids = servicosIds.map(Number)
      } else {
        ids = String(servicosIds).split(',').map(Number)
      }

      const servicos = await servicoService.buscarPorIds(ids, Number(barbeiroId))
      const duracaoTotal = servicos.reduce((acc, s) => acc + s.duracao_minutos, 0)

      if (duracaoTotal === 0) {
        return res.status(400).json({ error: 'Serviços não encontrados ou duração inválida.' })
      }

      const horarios = await vagasService.listarHorariosInicioDisponiveis(
        Number(barbeiroId),
        String(data),
        duracaoTotal
      )

      res.json({ horarios, duracaoTotal })
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

  async listarDisponiveis(req: Request, res: Response) {
    try {
      const { barbeiroId, data } = req.query
      const vagas = await vagasService.listarDisponiveis(Number(barbeiroId), String(data))
      res.json(vagas)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

  async buscarBlocoLivre(req: Request, res: Response) {
    try {
      const { barbeiroId, horarioDesejado, duracaoMinutos } = req.query
      const bloco = await vagasService.buscarBlocoLivre(
        Number(barbeiroId),
        String(horarioDesejado),
        Number(duracaoMinutos)
      )
      res.json(bloco)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

  async reservarSlots(req: Request, res: Response) {
    try {
      const { barbeiroId, inicioDesejado, duracaoMinutos } = req.body
      const bloco = await vagasService.reservarVagasParaAgendamento(
        barbeiroId,
        inicioDesejado,
        duracaoMinutos
      )
      if (!bloco) return res.status(409).json({ error: 'Não há vagas disponíveis suficientes.' })
      res.status(200).json(bloco)
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

  async bloquearHorario(req: Request, res: Response) {
    try {
      const { barbeiroId, inicio, fim, motivo } = req.body
      const vagas = await vagasService.bloquearHorario(barbeiroId, inicio, fim, motivo)
      res.status(200).json({ bloqueados: vagas })
    } catch (err) {
      res.status(400).json({ error: (err as Error).message })
    }
  },

}
