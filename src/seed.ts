import { db } from './database/sqlite'
import bcrypt from 'bcrypt'

function run(sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, function (err: any) {
      if (err) {
        console.error(`❌ Erro: ${err.message}`)
        return reject(err)
      }
      resolve()
    })
  })
}

async function seed() {
  console.log('Iniciando Seed...')
  
  try {
    console.log('Limpando dados antigos...')
    await run(`DELETE FROM clientes`)
    await run(`DELETE FROM barbeiros`)
    await run(`DELETE FROM servicos`)

    console.log('Inserindo Clientes...')
    const clienteHash = await bcrypt.hash('cliente123', 10)
    await run(`INSERT INTO clientes (nome, email, telefone, password_hash, ativo) VALUES ('Cliente Teste', 'cliente@email.com', '11999999999', '${clienteHash}', 1)`)

    console.log('Inserindo Admin...')
    const adminHash = await bcrypt.hash('admin123', 10)
    await run(`INSERT INTO admins (usuario, nome, email, password_hash, ativo) VALUES ('admin', 'Administrador', 'admin@email.com', '${adminHash}', 1)`)

    console.log('Inserindo Barbeiros com FOTO...')
    await run(`INSERT INTO barbeiros (nome_profissional, bio, foto_url, ativo) 
      VALUES ('Mestre da Navalha', 'Especialista em cortes clássicos e barboterapia.', 'https://placehold.co/400x400/333/FFF?text=Mestre', 1)`)
      
    await run(`INSERT INTO barbeiros (nome_profissional, bio, foto_url, ativo) 
      VALUES ('João Degradê', 'O rei do disfarçado e cortes modernos.', 'https://placehold.co/400x400/555/FFF?text=Joao', 1)`)

    console.log('Inserindo Serviços...')
    await run(`INSERT INTO servicos (nome, descricao, duracao_minutos, preco_centavos, ativo) VALUES ('Corte Degradê', 'Acabamento na navalha', 45, 3500, 1)`)
    await run(`INSERT INTO servicos (nome, descricao, duracao_minutos, preco_centavos, ativo) VALUES ('Barba Completa', 'Com toalha quente', 30, 2500, 1)`)

    console.log('Seed finalizado!')
    process.exit(0)

  } catch (error) {
    console.error('Falha na Seed:', error)
    process.exit(1)
  }
}

seed()
