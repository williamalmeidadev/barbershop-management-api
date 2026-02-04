import { Router } from 'express'
import { adminClientesController } from '../controllers/adminClientesController'
import { verifyToken } from '../middlewares/verifyToken'
import { isAdmin } from '../middlewares/verifyAdmin'

const router = Router()

router.use(verifyToken)
router.use(isAdmin)

router.get('/simples', adminClientesController.listarSimples)
router.get('/', adminClientesController.listar)
router.get('/:id', adminClientesController.buscarPorId)
router.put('/:id', adminClientesController.atualizar)
router.delete('/:id', adminClientesController.desativar)
router.delete('/:id/permanente', adminClientesController.apagarPermanente)

export default router
