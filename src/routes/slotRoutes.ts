import { Router } from 'express'
import { slotController } from '../controllers/slotController'

const router = Router()

router.post('/slots/gerar', slotController.gerarAgendaDoDia)

router.get('/slots/disponiveis', slotController.listarDisponiveis)

router.get('/slots/todos', slotController.listarTodos)

router.get('/slots/bloco-livre', slotController.buscarBlocoLivre)

router.post('/slots/reservar', slotController.reservarSlots)

router.post('/slots/bloquear', slotController.bloquearHorario)

router.post('/slots/liberar', slotController.liberarSlotsDoAgendamento)

router.get('/slots/todos', slotController.listarTodos)
router.post('/slots/gerar', slotController.gerarAgendaDoDia)
router.get('/slots/disponiveis', slotController.listarDisponiveis)
router.get('/slots/bloco-livre', slotController.buscarBlocoLivre)
router.post('/slots/reservar', slotController.reservarSlots)
router.post('/slots/bloquear', slotController.bloquearHorario)
router.post('/slots/liberar', slotController.liberarSlotsDoAgendamento)

export default router
