import { db } from './database/sqlite'
import bcrypt from 'bcrypt'

function run(sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err: any) {
      if (err) {
        console.error(`❌ Erro: ${err.message}`)
        return reject(err)
      }
      resolve()
    })
  })
}

function runWithId(sql: string, params: any[] = []): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err: any) {
      if (err) {
        console.error(`❌ Erro: ${err.message}`)
        return reject(err)
      }
      resolve(this.lastID)
    })
  })
}

function getUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function buildUtcDate(date: Date, hour: number, minute: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hour, minute, 0))
}

async function seed() {
  console.log('Iniciando Seed...')

  try {
    console.log('Limpando dados antigos...')
    await run(`DELETE FROM agendamento_vagas`)
    await run(`DELETE FROM agendamento_servicos`)
    await run(`DELETE FROM agendamentos`)
    await run(`DELETE FROM vagas`)
    await run(`DELETE FROM servicos`)
    await run(`DELETE FROM barbeiros`)
    await run(`DELETE FROM clientes`)
    await run(`DELETE FROM admins`)

    console.log('Inserindo Clientes...')
    const clienteHash = await bcrypt.hash('cliente123', 10)
    const clienteId1 = await runWithId(
      `INSERT INTO clientes (nome, email, telefone, password_hash, ativo) VALUES (?, ?, ?, ?, 1)`,
      ['Cliente Teste', 'cliente@email.com', '11999999999', clienteHash]
    )
    const clienteId2 = await runWithId(
      `INSERT INTO clientes (nome, email, telefone, password_hash, ativo) VALUES (?, ?, ?, ?, 1)`,
      ['Maria Cliente', 'maria@email.com', '11988887777', clienteHash]
    )

    console.log('Inserindo Admin...')
    const adminHash = await bcrypt.hash('admin123', 10)
    await run(
      `INSERT INTO admins (usuario, nome, email, password_hash, ativo) VALUES (?, ?, ?, ?, 1)`,
      ['admin', 'Administrador', 'admin@email.com', adminHash]
    )

    console.log('Inserindo Barbeiros...')
    const barbeiroId1 = await runWithId(
      `INSERT INTO barbeiros (nome_profissional, bio, foto_url, ativo) VALUES (?, ?, ?, 1)`,
      ['Mestre da Navalha', 'Especialista em cortes clássicos e barboterapia.', null]
    )
    const barbeiroId2 = await runWithId(
      `INSERT INTO barbeiros (nome_profissional, bio, foto_url, ativo) VALUES (?, ?, ?, 1)`,
      ['João Degradê', 'O rei do disfarçado e cortes modernos.', null]
    )

    console.log('Inserindo Serviços...')
    const servicoId1 = await runWithId(
      `INSERT INTO servicos (barbeiro_id, nome, descricao, duracao_minutos, preco_centavos, foto_url, ativo) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [barbeiroId1, 'Corte Tradicional', 'Corte clássico com acabamento na navalha', 30, 3000, null]
    )
    const servicoId2 = await runWithId(
      `INSERT INTO servicos (barbeiro_id, nome, descricao, duracao_minutos, preco_centavos, foto_url, ativo) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [barbeiroId1, 'Barba Completa', 'Modelagem com toalha quente', 30, 2500, null]
    )
    const servicoId3 = await runWithId(
      `INSERT INTO servicos (barbeiro_id, nome, descricao, duracao_minutos, preco_centavos, foto_url, ativo) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [barbeiroId2, 'Corte Premium', 'Corte + lavagem + finalização', 60, 6000, null]
    )

    console.log('Inserindo Vagas...')
    const baseDate = new Date()
    baseDate.setUTCDate(baseDate.getUTCDate() + 1)
    const dataUtc = getUtcDateString(baseDate)
    const slots: number[] = []
    for (let hour = 12; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const inicio = buildUtcDate(baseDate, hour, minute)
        const fim = new Date(inicio.getTime() + 30 * 60000)
        const vagaId = await runWithId(
          `INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES (?, ?, ?, 'DISPONIVEL')`,
          [barbeiroId1, inicio.toISOString(), fim.toISOString()]
        )
        slots.push(vagaId)
      }
    }

    console.log('Inserindo Agendamentos...')
    const agendamento1Inicio = buildUtcDate(baseDate, 12, 0)
    const agendamento1Fim = new Date(agendamento1Inicio.getTime() + 30 * 60000)
    const agendamentoId1 = await runWithId(
      `INSERT INTO agendamentos (cliente_id, barbeiro_id, inicio, fim, status, valor_original_centavos, desconto_aplicado_centavos, valor_total_centavos)
       VALUES (?, ?, ?, ?, 'AGENDADO', ?, 0, ?)`,
      [clienteId1, barbeiroId1, agendamento1Inicio.toISOString(), agendamento1Fim.toISOString(), 3000, 3000]
    )
    await run(
      `INSERT INTO agendamento_servicos (agendamento_id, servico_id, preco_centavos, duracao_minutos) VALUES (?, ?, ?, ?)`,
      [agendamentoId1, servicoId1, 3000, 30]
    )
    await run(
      `INSERT INTO agendamento_vagas (agendamento_id, vaga_id) VALUES (?, ?)`,
      [agendamentoId1, slots[0]]
    )
    await run(`UPDATE vagas SET status = 'RESERVADO' WHERE id = ?`, [slots[0]])

    const agendamento2Inicio = buildUtcDate(baseDate, 13, 0)
    const agendamento2Fim = new Date(agendamento2Inicio.getTime() + 60 * 60000)
    const agendamentoId2 = await runWithId(
      `INSERT INTO agendamentos (cliente_id, barbeiro_id, inicio, fim, status, valor_original_centavos, desconto_aplicado_centavos, valor_total_centavos)
       VALUES (?, ?, ?, ?, 'SOLICITADO', ?, 0, ?)`,
      [clienteId2, barbeiroId1, agendamento2Inicio.toISOString(), agendamento2Fim.toISOString(), 6000, 6000]
    )
    await run(
      `INSERT INTO agendamento_servicos (agendamento_id, servico_id, preco_centavos, duracao_minutos) VALUES (?, ?, ?, ?)`,
      [agendamentoId2, servicoId3, 6000, 60]
    )
    await run(
      `INSERT INTO agendamento_vagas (agendamento_id, vaga_id) VALUES (?, ?)`,
      [agendamentoId2, slots[2]]
    )
    await run(
      `INSERT INTO agendamento_vagas (agendamento_id, vaga_id) VALUES (?, ?)`,
      [agendamentoId2, slots[3]]
    )
    // vagas do agendamento solicitado ficam DISPONIVEL

    console.log('Seed finalizado!')
    process.exit(0)

  } catch (error) {
    console.error('Falha na Seed:', error)
    process.exit(1)
  }
}

seed()
