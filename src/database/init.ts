import { db } from './sqlite'
import bcrypt from 'bcrypt'

export function initDatabase() {
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON')

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
    `)

    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`)

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

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminUsuario = process.env.ADMIN_USUARIO || 'admin'
    const adminNome = process.env.ADMIN_NOME || 'Administrador'

    if (adminEmail && adminPassword) {
      db.get(
        'SELECT id FROM admins WHERE email = ? OR usuario = ?',
        [adminEmail, adminUsuario],
        (err, row) => {
          if (err) {
            console.error('Erro ao verificar admin inicial:', err.message)
            return
          }
          if (row) return
          const passwordHash = bcrypt.hashSync(adminPassword, 10)
          db.run(
            `INSERT INTO admins (usuario, nome, email, password_hash, ativo) VALUES (?, ?, ?, ?, 1)`,
            [adminUsuario, adminNome, adminEmail, passwordHash],
            (insertErr) => {
              if (insertErr) {
                console.error('Erro ao criar admin inicial:', insertErr.message)
              }
            }
          )
        }
      )
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefone TEXT,
        password_hash TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0 CHECK (is_verified IN (0,1)),
        verification_token TEXT,
        concluidos_count INTEGER DEFAULT 0,
        desconto_disponivel_centavos INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ativo INTEGER DEFAULT 1 CHECK (ativo IN (0,1))
      );
    `)

    db.run(`CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);`)
    db.run(`ALTER TABLE clientes ADD COLUMN is_verified INTEGER DEFAULT 0 CHECK (is_verified IN (0,1))`, (err) => {
      if (err && !String(err.message).includes('duplicate column')) {
        console.error('Erro ao adicionar coluna is_verified em clientes:', err.message)
      }
    })
    db.run(`ALTER TABLE clientes ADD COLUMN verification_token TEXT`, (err) => {
      if (err && !String(err.message).includes('duplicate column')) {
        console.error('Erro ao adicionar coluna verification_token em clientes:', err.message)
      }
    })

    db.run(`
      CREATE TABLE IF NOT EXISTS barbeiros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_profissional TEXT UNIQUE NOT NULL,
        bio TEXT,
        foto_url TEXT,
        ativo INTEGER DEFAULT 1 CHECK (ativo IN (0,1))
      );
    `)

    db.run(`CREATE INDEX IF NOT EXISTS idx_barbeiros_nome ON barbeiros(nome_profissional);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_barbeiros_ativo ON barbeiros(ativo);`)

    db.run(`
      CREATE TABLE IF NOT EXISTS servicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barbeiro_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        descricao TEXT,
        duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos > 0),
        preco_centavos INTEGER NOT NULL CHECK (preco_centavos >= 0),
        foto_url TEXT,
        ativo INTEGER DEFAULT 1 CHECK (ativo IN (0,1)),
        FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id)
      );
    `)

    db.run(`CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON servicos(ativo);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_servicos_barbeiro ON servicos(barbeiro_id);`)
    db.run(`ALTER TABLE servicos ADD COLUMN barbeiro_id INTEGER`, (err) => {
      if (err && !String(err.message).includes('duplicate column')) {
        console.error('Erro ao adicionar coluna barbeiro_id em servicos:', err.message)
      }
    })
    db.run(`ALTER TABLE servicos ADD COLUMN foto_url TEXT`, (err) => {
      if (err && !String(err.message).includes('duplicate column')) {
        console.error('Erro ao adicionar coluna foto_url em servicos:', err.message)
      }
    })

    db.run(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        chave TEXT PRIMARY KEY,
        valor_int INTEGER,
        valor_text TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    db.run(`
      CREATE TABLE IF NOT EXISTS vagas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barbeiro_id INTEGER NOT NULL,
        inicio DATETIME NOT NULL,
        fim DATETIME NOT NULL,
        status TEXT NOT NULL DEFAULT 'DISPONIVEL'
          CHECK (status IN ('DISPONIVEL','RESERVADO','BLOQUEADO')),
        motivo_bloqueio TEXT,
        FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id)
      );
    `)

    db.run(`CREATE INDEX IF NOT EXISTS idx_vagas_barbeiro ON vagas(barbeiro_id);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_vagas_inicio ON vagas(inicio);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_vagas_status ON vagas(status);`)
    db.run(`ALTER TABLE vagas ADD COLUMN motivo_bloqueio TEXT`, (err) => {
      if (err && !String(err.message).includes('duplicate column')) {
        console.error('Erro ao adicionar coluna motivo_bloqueio em vagas:', err.message)
      }
    })

    db.run(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        barbeiro_id INTEGER NOT NULL,
        inicio DATETIME NOT NULL,
        fim DATETIME NOT NULL,
        concluido_em DATETIME,
        pagamento_tipo TEXT CHECK (pagamento_tipo IN ('DINHEIRO','PIX','CARTAO')),
        status TEXT NOT NULL DEFAULT 'SOLICITADO'
          CHECK (status IN ('SOLICITADO','AGENDADO','CANCELADO','CONCLUIDO','RECUSADO')),
        valor_original_centavos INTEGER NOT NULL DEFAULT 0,
        desconto_aplicado_centavos INTEGER NOT NULL DEFAULT 0,
        valor_total_centavos INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id)
      );
    `)

    db.run(`CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_agendamentos_barbeiro ON agendamentos(barbeiro_id);`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);`)
    db.run(`ALTER TABLE agendamentos ADD COLUMN pagamento_tipo TEXT`, (err) => {
      if (err && !String(err.message).includes('duplicate column')) {
        console.error('Erro ao adicionar coluna pagamento_tipo em agendamentos:', err.message)
      }
    })

    db.run(`
      CREATE TABLE IF NOT EXISTS agendamento_servicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agendamento_id INTEGER NOT NULL,
        servico_id INTEGER NOT NULL,
        preco_centavos INTEGER NOT NULL,
        duracao_minutos INTEGER NOT NULL,
        FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
        FOREIGN KEY (servico_id) REFERENCES servicos(id)
      );
    `)

    db.run(`CREATE INDEX IF NOT EXISTS idx_ag_serv_agendamento ON agendamento_servicos(agendamento_id);`)

    db.run(`
      CREATE TABLE IF NOT EXISTS agendamento_vagas (
        agendamento_id INTEGER NOT NULL,
        vaga_id INTEGER NOT NULL,
        PRIMARY KEY (agendamento_id, vaga_id),
        FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
        FOREIGN KEY (vaga_id) REFERENCES vagas(id) ON DELETE CASCADE
      );
    `)
  })
}
