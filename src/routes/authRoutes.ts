import { Router } from 'express'
import { authController } from '../controllers/authController'

const router = Router()

router.get('/verify', authController.verify)
router.post('/resend-verification', authController.resendVerification)

export default router
