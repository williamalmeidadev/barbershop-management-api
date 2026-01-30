import express from 'express'
import routes from './routes/routes'
import path from 'path';

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')));
app.use(routes)
app.use('/images', express.static(path.resolve(__dirname, '..', 'public', 'images')))

export default app
