import { db } from './database/sqlite'


async function seed() {
  // Users
  await run(`INSERT INTO users (email, password_hash) VALUES ('user1@email.com', 'userhash1')`)
  await run(`INSERT INTO users (email, password_hash) VALUES ('user2@email.com', 'userhash2')`)

  // Admins
  await run(`INSERT INTO admins (usuario, nome, email, password_hash, ativo) VALUES ('admin', 'Administrador', 'admin@email.com', 'adminhash', 1)`)
  await run(`INSERT INTO admins (usuario, nome, email, password_hash, ativo) VALUES ('admin2', 'Admin 2', 'admin2@email.com', 'adminhash2', 1)`)

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

  // Vagas (slots)
  await run(`INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES (1, '2026-01-28T14:00:00.000Z', '2026-01-28T14:20:00.000Z', 'DISPONIVEL')`)
  await run(`INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES (1, '2026-01-28T14:20:00.000Z', '2026-01-28T14:40:00.000Z', 'DISPONIVEL')`)
  await run(`INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES (2, '2026-01-28T15:00:00.000Z', '2026-01-28T15:15:00.000Z', 'DISPONIVEL')`)

  // Agendamentos
  await run(`INSERT INTO agendamentos (cliente_id, barbeiro_id, inicio, fim, status, valor_total_centavos) VALUES (1, 1, '2026-01-28T14:00:00.000Z', '2026-01-28T14:40:00.000Z', 'AGENDADO', 5000)`)
  await run(`INSERT INTO agendamentos (cliente_id, barbeiro_id, inicio, fim, status, valor_total_centavos) VALUES (2, 2, '2026-01-28T15:00:00.000Z', '2026-01-28T15:15:00.000Z', 'AGENDADO', 2000)`)

  // Agendamento_servicos
  await run(`INSERT INTO agendamento_servicos (agendamento_id, servico_id, preco_centavos, duracao_minutos) VALUES (1, 1, 3000, 20)`)
  await run(`INSERT INTO agendamento_servicos (agendamento_id, servico_id, preco_centavos, duracao_minutos) VALUES (1, 2, 2000, 15)`)
  await run(`INSERT INTO agendamento_servicos (agendamento_id, servico_id, preco_centavos, duracao_minutos) VALUES (2, 2, 2000, 15)`)

  // Agendamento_vagas
  await run(`INSERT INTO agendamento_vagas (agendamento_id, vaga_id) VALUES (1, 1)`)
  await run(`INSERT INTO agendamento_vagas (agendamento_id, vaga_id) VALUES (1, 2)`)
  await run(`INSERT INTO agendamento_vagas (agendamento_id, vaga_id) VALUES (2, 3)`)

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
