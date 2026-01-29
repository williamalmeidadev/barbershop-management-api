import { Router } from 'express'
import { loginController } from '../controllers/loginController'

const router = Router()

router.post('/login/admin', loginController.loginAdmin)

export default router
