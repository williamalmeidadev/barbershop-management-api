import sqlite3 from 'sqlite3'
import path from 'path'

sqlite3.verbose()

const dbPath = path.resolve(__dirname, '../../barbershop.db')

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`Erro ao conectar no SQLite [Modo: ${isTest ? 'TESTE/MEMÓRIA' : 'PRODUÇÃO/ARQUIVO'}]`, err)
  } else {
    if (!isTest) {
      console.log('SQLite database connected')
    }
  }
})