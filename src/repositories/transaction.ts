import { db } from '../database/sqlite'

export async function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    db.serialize(async () => {
      db.run('BEGIN TRANSACTION')
      try {
        const result = await fn()
        db.run('COMMIT', (commitErr) => {
          if (commitErr) {
            db.run('ROLLBACK')
            return reject(commitErr)
          }
          resolve(result)
        })
      } catch (err) {
        db.run('ROLLBACK')
        reject(err)
      }
    })
  })
}
