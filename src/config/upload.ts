import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

// Garantee that the upload directory exists
const uploadDir = path.resolve(__dirname, '..', '..', 'public', 'assets', 'images')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const allowedMimes = new Set(['image/jpeg', 'image/pjpeg', 'image/png', 'image/jpg', 'image/webp'])
const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.webp'])

export const uploadConfig = {
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase()
      const safeExt = allowedExts.has(ext) ? ext : ''
      const randomName = crypto.randomBytes(16).toString('hex')
      callback(null, `${Date.now()}-${randomName}${safeExt}`)
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  // Filter to allow only image files
  fileFilter: (req: any, file: any, callback: any) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedMimes.has(file.mimetype) && allowedExts.has(ext)) {
      callback(null, true)
      return
    }
    callback(new Error('Formato de arquivo inválido.'))
  }
}
