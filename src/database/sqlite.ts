import sqlite3 from 'sqlite3'
import path from 'path'

sqlite3.verbose()

const isTest = process.env.NODE_ENV === 'test'

const dbPath = isTest 
  ? ':memory:' 
  : path.resolve(__dirname, '../../database.sqlite')

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`Erro ao conectar no SQLite [Modo: ${isTest ? 'TESTE/MEMÓRIA' : 'PRODUÇÃO/ARQUIVO'}]`, err)
  } else {
    if (!isTest) {
      console.log('SQLite database connected')
    }
  }
})