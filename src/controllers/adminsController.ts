import { Request, Response } from 'express'
import { adminsService } from '../services/adminsService'

export const adminsController = {
  async criar(req: Request, res: Response) {
    try {
      const result = await adminsService.criar(req.body)
      res.status(201).json({ message: 'Admin cadastrado com sucesso', adminId: result.adminId })
    } catch (err: any) {
      const status = err.message?.includes('já') ? 409 : 400
      res.status(status).json({ error: err.message })
    }
  }
}
