import express from 'express'
import routes from './routes/routes'
import path from 'path'
import { verifyTokenPage, verifyTokenPageClient } from './middlewares/verifyToken'
import { isAdmin } from './middlewares/verifyAdmin'

const app = express()
const publicDir = path.join(__dirname, '../public')
const basePath = '/server08'

app.use(express.json())

// Handle double-slash paths coming from reverse proxies
app.use((req, _res, next) => {
  if (req.url.startsWith('//')) {
    req.url = req.url.replace(/^\/+/, '/')
  }
  next()
})

// Protect app routes (client area)
app.use('/app', verifyTokenPageClient)
app.use(`${basePath}/app`, verifyTokenPageClient)

// HTML pages via explicit routes
app.get('/', (_, res) => res.sendFile(path.join(publicDir, 'index.html')))
app.get('/login', (_, res) => res.sendFile(path.join(publicDir, 'pages', 'login.html')))
app.get('/admin-login', (_, res) => res.sendFile(path.join(publicDir, 'pages', 'admin-login.html')))
app.get('/register', (_, res) => res.sendFile(path.join(publicDir, 'pages', 'register.html')))
app.get('/register', (_, res) => res.sendFile(path.join(publicDir, 'pages', 'register.html')))
app.get('/profile', (_, res) => res.sendFile(path.join(publicDir, 'pages', 'profile.html')))
app.get('/app', (_, res) => res.sendFile(path.join(publicDir, 'pages', 'app.html')))
app.get('/verify-email', (_, res) => res.sendFile(path.join(publicDir, 'pages', 'verify-email.html')))
app.get('/verified', (_, res) => res.sendFile(path.join(publicDir, 'pages', 'verified.html')))
app.get('/admin', verifyTokenPage, isAdmin, (_, res) => {
  res.set('Cache-Control', 'no-store')
  res.sendFile(path.join(publicDir, 'pages', 'admin.html'))
})

// Base path support (subpath deploy)
app.get(`${basePath}`, (_, res) => res.redirect(`${basePath}/`))
app.get(`${basePath}/`, (_, res) => res.sendFile(path.join(publicDir, 'index.html')))
app.get(`${basePath}/login`, (_, res) => res.sendFile(path.join(publicDir, 'pages', 'login.html')))
app.get(`${basePath}/admin-login`, (_, res) => res.sendFile(path.join(publicDir, 'pages', 'admin-login.html')))
app.get(`${basePath}/register`, (_, res) => res.sendFile(path.join(publicDir, 'pages', 'register.html')))
app.get(`${basePath}/register`, (_, res) => res.sendFile(path.join(publicDir, 'pages', 'register.html')))
app.get(`${basePath}/profile`, (_, res) => res.sendFile(path.join(publicDir, 'pages', 'profile.html')))
app.get(`${basePath}/app`, (_, res) => res.sendFile(path.join(publicDir, 'pages', 'app.html')))
app.get(`${basePath}/verify-email`, (_, res) => res.sendFile(path.join(publicDir, 'pages', 'verify-email.html')))
app.get(`${basePath}/verified`, (_, res) => res.sendFile(path.join(publicDir, 'pages', 'verified.html')))
app.get(`${basePath}/admin`, verifyTokenPage, isAdmin, (_, res) => {
  res.set('Cache-Control', 'no-store')
  res.sendFile(path.join(publicDir, 'pages', 'admin.html'))
})

// Block direct access to HTML files
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    return res.status(404).json({ error: 'Not found' })
  }
  return next()
})

app.use(express.static(publicDir, { index: false }))
app.use(basePath, express.static(publicDir, { index: false }))
app.use(routes)
app.use(basePath, routes)
app.use('/assets/images', express.static(path.resolve(__dirname, '..', 'public', 'assets', 'images')))
app.use(`${basePath}/assets/images`, express.static(path.resolve(__dirname, '..', 'public', 'assets', 'images')))
// Backward compatibility for old image URLs
app.use('/images', express.static(path.resolve(__dirname, '..', 'public', 'assets', 'images')))
app.use(`${basePath}/images`, express.static(path.resolve(__dirname, '..', 'public', 'assets', 'images')))

export default app
