import { db } from './database/sqlite'


async function seed() {
  
  // Clientes
  await run(`INSERT INTO clientes (nome, email, telefone, password_hash, ativo) VALUES ('Cliente 1', 'cliente1@email.com', '11999999999', 'hash1', 1)`)
  await run(`INSERT INTO clientes (nome, email, telefone, password_hash, ativo) VALUES ('Cliente 2', 'cliente2@email.com', '11888888888', 'hash2', 1)`)

  // Barbeiros
  await run(`INSERT INTO barbeiros (nome_profissional, bio, ativo) VALUES ('Barbeiro 1', 'Especialista em cortes', 1)`)
  await run(`INSERT INTO barbeiros (nome_profissional, bio, ativo) VALUES ('Barbeiro 2', 'Barba e cabelo', 1)`)

  // Serviços
  await run(`INSERT INTO servicos (nome, descricao, duracao_minutos, preco_centavos, ativo) VALUES ('Corte Simples', 'Corte de cabelo tradicional', 20, 3000, 1)`)
  await run(`INSERT INTO servicos (nome, descricao, duracao_minutos, preco_centavos, ativo) VALUES ('Barba', 'Barba completa', 15, 2000, 1)`)
  await run(`INSERT INTO servicos (nome, descricao, duracao_minutos, preco_centavos, ativo) VALUES ('Sobrancelha', 'Design de sobrancelha', 10, 1500, 1)`)


  console.log('Seed finalizado!')
  process.exit(0)
}

function run(sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, (err: any) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

seed()
