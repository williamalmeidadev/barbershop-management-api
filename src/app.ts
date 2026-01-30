import express from 'express'
import routes from './routes/routes'
import path from 'path'
import { verifyTokenPage } from './middlewares/verifyToken'
import { isAdmin } from './middlewares/verifyAdmin'

const app = express()
const publicDir = path.join(__dirname, '../public')

app.use(express.json())

// HTML pages via explicit routes
app.get('/', (_, res) => res.sendFile(path.join(publicDir, 'index.html')))
app.get('/login', (_, res) => res.sendFile(path.join(publicDir, 'login.html')))
app.get('/admin-login', (_, res) => res.sendFile(path.join(publicDir, 'admin-login.html')))
app.get('/register', (_, res) => res.sendFile(path.join(publicDir, 'register.html')))
app.get('/admin', verifyTokenPage, isAdmin, (_, res) => {
  res.set('Cache-Control', 'no-store')
  res.sendFile(path.join(publicDir, 'admin.html'))
})

// Block direct access to HTML files
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    return res.status(404).json({ error: 'Not found' })
  }
  return next()
})

app.use(express.static(publicDir, { index: false }))
app.use(routes)
app.use('/images', express.static(path.resolve(__dirname, '..', 'public', 'images')))

export default app
