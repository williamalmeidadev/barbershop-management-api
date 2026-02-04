import { Router } from 'express'
import multer from 'multer'
import { uploadConfig } from '../config/upload'
import { servicosController } from '../controllers/servicosController'
import { verifyToken } from '../middlewares/verifyToken'
import { isAdmin } from '../middlewares/verifyAdmin'

const router = Router()
const upload = multer(uploadConfig)
const uploadFoto = upload.single('foto')

router.post('/', verifyToken, isAdmin, servicosController.criar)

router.put('/:id', verifyToken, isAdmin, servicosController.atualizar)

router.delete('/:id', verifyToken, isAdmin, servicosController.desativar)
router.delete('/:id/permanente', verifyToken, isAdmin, servicosController.apagarPermanente)

router.delete('/:id/foto', verifyToken, isAdmin, servicosController.removerFoto)
router.patch('/:id/foto', verifyToken, isAdmin, (req, res, next) => {
  uploadFoto(req, res, (err) => {
    if (err) {
      const fallback = 'Erro ao enviar arquivo.'
      const message =
        err instanceof multer.MulterError
          ? err.code === 'LIMIT_FILE_SIZE'
            ? 'Arquivo muito grande. Limite de 2MB.'
            : err.message
          : (err instanceof Error ? err.message : fallback)
      return res.status(400).json({ error: message })
    }
    return next()
  })
}, servicosController.uploadFoto)

router.get('/', servicosController.listar)

router.get('/:id', servicosController.buscarPorId)

export default router
