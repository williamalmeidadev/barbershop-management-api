import 'dotenv/config'

import app from './app'
import { initDatabase } from './database/init'

const PORT = Number(process.env.PORT) || 3333

initDatabase()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
