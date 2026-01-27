import sqlite3 from 'sqlite3'
import path from 'path'

sqlite3.verbose()

const dbPath = path.resolve(__dirname, '../../database.sqlite')

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database', err)
  } else {
    console.log('SQLite database connected')
  }
})
