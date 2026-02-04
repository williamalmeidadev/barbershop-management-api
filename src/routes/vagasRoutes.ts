import { Router } from 'express'
import { slotController } from '../controllers/vagasController'
import { verifyToken } from '../middlewares/verifyToken'
import { isAdmin } from '../middlewares/verifyAdmin'

const router = Router()

router.post('/gerar', verifyToken, isAdmin, slotController.gerarAgendaDoDia)

router.delete('/apagar', verifyToken, isAdmin, slotController.apagarSlot)

router.post('/bloquear', verifyToken, isAdmin, slotController.bloquearHorario)

router.post('/reservar', verifyToken, slotController.reservarSlots)

router.get('/disponiveis', slotController.listarDisponiveis)
router.get('/disponibilidade-servicos', slotController.listarDisponibilidadeServicos)

router.get('/todos', slotController.listarTodos)

router.get('/bloco-livre', slotController.buscarBlocoLivre)

export default router
