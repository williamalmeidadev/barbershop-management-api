import { Router } from 'express'
import { barbeirosController } from '../controllers/barbeirosController'

const router = Router()

router.post('/', barbeirosController.criar)
router.get('/', barbeirosController.listar)
router.get('/:id', barbeirosController.buscarPorId)
router.put('/:id', barbeirosController.atualizar)
router.delete('/:id', barbeirosController.desativar)

export default router
