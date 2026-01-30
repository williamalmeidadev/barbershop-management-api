import { Router } from 'express'
import { configuracoesController } from '../controllers/configuracoesController'
import { verifyToken } from '../middlewares/verifyToken'
import { isAdmin } from '../middlewares/verifyAdmin'

const router = Router()

router.use(verifyToken)
router.use(isAdmin)

router.get('/descontos', configuracoesController.obterDescontos)
router.put('/descontos', configuracoesController.atualizarDescontos)
router.delete('/descontos', configuracoesController.removerDescontos)

export default router
