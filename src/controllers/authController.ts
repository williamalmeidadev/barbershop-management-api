import { Request, Response, NextFunction } from 'express'
import { clientesService } from '../services/clientesService'

export const authController = {
    async verify(req: Request, res: Response, next: NextFunction) {
        try {
            const { token } = req.query

            if (!token || typeof token !== 'string') {
                return res.status(400).json({ error: 'Token inválido.' })
            }

            await clientesService.verificarCadastro(token)

            // Redireciona para o frontend após sucesso
            const frontendUrl = process.env.FRONTEND_URL || process.env.API_URL || 'http://localhost:3333'
            return res.redirect(`${frontendUrl}/verified`) // Redirect to new success page
        } catch (error: any) {
            console.error('Erro na verificação de email:', error)
            return res.status(400).json({ error: error.message || 'Erro ao verificar e-mail.' })
        }
    },

    async resendVerification(req: Request, res: Response) {
        try {
            const { email } = req.body
            await clientesService.resendVerification(email)
            return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um novo link de verificação foi enviado.' })
        } catch (error: any) {
            console.error('Erro ao reenviar verificação:', error)
            return res.status(400).json({ error: error.message || 'Erro ao reenviar e-mail.' })
        }
    }
}
