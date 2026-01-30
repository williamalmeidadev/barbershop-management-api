import { Request, Response } from 'express'
import { configuracoesService } from '../services/configuracoesService'

export const configuracoesController = {
  async obterDescontos(_: Request, res: Response) {
    try {
      const regras = await configuracoesService.obterRegrasDesconto()
      res.json(regras)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  },

  async atualizarDescontos(req: Request, res: Response) {
    try {
      await configuracoesService.atualizarRegrasDesconto(req.body)
      const regras = await configuracoesService.obterRegrasDesconto()
      res.json(regras)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
  ,
  async removerDescontos(_: Request, res: Response) {
    try {
      await configuracoesService.removerRegrasDesconto()
      res.status(204).send()
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
}
