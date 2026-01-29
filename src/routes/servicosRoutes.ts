import { Router } from 'express'
import { servicosController } from '../controllers/servicosController'
import { verifyToken } from '../middlewares/verifyToken'
import { isAdmin } from '../middlewares/verifyAdmin'

const router = Router()

router.post('/', verifyToken, isAdmin, servicosController.criar)

router.put('/:id', verifyToken, isAdmin, servicosController.atualizar)

router.delete('/:id', verifyToken, isAdmin, servicosController.desativar)

router.get('/', servicosController.listar)

router.get('/:id', servicosController.buscarPorId)

export default router