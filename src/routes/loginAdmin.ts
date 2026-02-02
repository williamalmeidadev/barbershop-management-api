import { Router } from 'express'
import { loginController } from '../controllers/loginController'
import { createRateLimiter } from '../middlewares/rateLimiter'

const router = Router()

const adminLoginLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
  keyPrefix: 'admin-login:',
  keyGenerator: (req) => {
    const email = String((req.body?.email || '')).toLowerCase().trim()
    const xff = req.headers['x-forwarded-for']
    const ip = Array.isArray(xff) ? xff[0] : xff?.split(',')[0]?.trim()
    const addr = ip || req.ip || req.socket.remoteAddress || 'unknown'
    return email ? `${addr}:${email}` : addr
  }
})

router.post('/login/admin', adminLoginLimiter, loginController.loginAdmin)

export default router
