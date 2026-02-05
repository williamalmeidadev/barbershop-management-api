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
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
            return res.redirect(`${frontendUrl}/login?verified=true`)
        } catch (error: any) {
            console.error('Erro na verificação de email:', error)
            return res.status(400).json({ error: error.message || 'Erro ao verificar e-mail.' })
        }
    }
}
