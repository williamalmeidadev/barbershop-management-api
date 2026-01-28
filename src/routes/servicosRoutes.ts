import { Router } from 'express'
import { servicosController } from '../controllers/servicosController'

const router = Router()

router.post('/', servicosController.criar)
router.get('/', servicosController.listar)
router.get('/:id', servicosController.buscarPorId)
router.put('/:id', servicosController.atualizar)
router.delete('/:id', servicosController.desativar)

export default router
