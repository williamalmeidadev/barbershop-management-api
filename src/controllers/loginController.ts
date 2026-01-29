import { Request, Response } from 'express'
import { loginService } from '../services/loginService'

export const loginController = {
  async loginCliente(req: Request, res: Response) {
    try {
      const token = await loginService.loginCliente(req.body)
      res.status(200).json({ token: token.token, role: 'cliente' })
    } catch (err: any) {
      const status = err.message?.includes('inativo') ? 403 : err.message?.includes('Credenciais') ? 401 : 400
      res.status(status).json({ error: err.message })
    }
  },

  async loginAdmin(req: Request, res: Response) {
    try {
      const token = await loginService.loginAdmin(req.body)
      res.status(200).json({ token: token.token, role: 'admin' })
    } catch (err: any) {
      const status = err.message?.includes('inativo') ? 403 : err.message?.includes('Credenciais') ? 401 : 400
      res.status(status).json({ error: err.message })
    }
  }
}
