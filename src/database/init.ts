import { db } from './sqlite'

export function initDatabase() {
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON')

    // ===================== ADMINS =====================
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE NOT NULL,
        nome TEXT NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ativo INTEGER DEFAULT 1 CHECK (ativo IN (0,1))
      );
    `)

    db.run(`CREATE INDEX IF NOT EXISTS idx_admins_usuario ON admins(usuario);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_admins_ativo ON admins(ativo);`)

    // ===================== CLIENTES =====================
    db.run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefone TEXT,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ativo INTEGER DEFAULT 1 CHECK (ativo IN (0,1))
      );
    `)

    db.run(`CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);`)

    // ===================== BARBEIROS =====================
    db.run(`
      CREATE TABLE IF NOT EXISTS barbeiros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_profissional TEXT UNIQUE NOT NULL,
        bio TEXT,
        ativo INTEGER DEFAULT 1 CHECK (ativo IN (0,1))
      );
    `)

    db.run(`CREATE INDEX IF NOT EXISTS idx_barbeiros_nome ON barbeiros(nome_profissional);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_barbeiros_ativo ON barbeiros(ativo);`)

    console.log('SQLite tables initialized')
  })
}
