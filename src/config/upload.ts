import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Garantee that the upload directory exists
const uploadDir = path.resolve(__dirname, '..', '..', 'public', 'images')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

export const uploadConfig = {
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => {
       // Generates a unique name: current-date + random-number + extension
      // Ex: 17628392-123123.jpg
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = path.extname(file.originalname)
      const name = path.basename(file.originalname, ext)
      
      callback(null, `${name}-${uniqueSuffix}${ext}`)
    }
  }),
  // Fiter to allow only image files
  fileFilter: (req: any, file: any, callback: any) => {
    const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/jpg']
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true)
    } else {
      callback(new Error('Formato de arquivo inválido.'))
    }
  }
}