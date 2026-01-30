import { db } from './database/sqlite'


async function seed() {
  
  // Agendamento de exemplo
  // Assumindo que os IDs criados automaticamente para cliente e barbeiro são 1
  // O serviço é relacionado via tabela agendamento_servicos
  await run(`INSERT INTO agendamentos (cliente_id, barbeiro_id, inicio, fim, status, valor_original_centavos, desconto_aplicado_centavos, valor_total_centavos) VALUES (1, 1, '2026-02-01 10:00', '2026-02-01 10:20', 'AGENDADO', 3000, 0, 3000)`)
  // Relaciona o serviço ao agendamento
  await run(`INSERT INTO agendamento_servicos (agendamento_id, servico_id, preco_centavos, duracao_minutos) VALUES (1, 1, 3000, 20)`)


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
