import { Router } from 'express'
import { bookingController } from '../controllers/agendamentosController'
import { verifyToken } from '../middlewares/verifyToken'
import { isAdmin } from '../middlewares/verifyAdmin'

const router = Router()

router.post('/', verifyToken, bookingController.criar)

router.get('/', verifyToken, isAdmin, bookingController.listar)

router.get('/me', verifyToken, bookingController.listarMe)

router.get('/cliente/:id', verifyToken, isAdmin, bookingController.listarPorCliente)

router.post('/:id/cancelar', verifyToken, bookingController.cancelar)

router.post('/:id/aceitar', verifyToken, isAdmin, bookingController.aceitar)

router.post('/:id/recusar', verifyToken, isAdmin, bookingController.recusar)

router.post('/:id/concluir', verifyToken, isAdmin, bookingController.concluir)

export default router
