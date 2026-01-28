import { expect } from 'chai'
import { db } from '../../src/database/sqlite' 
import { vagasRepository } from '../../src/repositories/vagasRepository' 
import { StatusVaga } from '../../src/interfaces/vaga' 

describe('VagasRepository (Integração)', () => {
    
    before(() => {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('ATENÇÃO: NODE_ENV deve ser "test"')
        }
    })

    beforeEach(async () => {
        await new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.run('PRAGMA foreign_keys = ON')
                db.run("DROP TABLE IF EXISTS vagas")
                db.run("DROP TABLE IF EXISTS barbeiros")
                
                db.run(`
                    CREATE TABLE barbeiros (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome_profissional TEXT UNIQUE NOT NULL,
                        bio TEXT,
                        ativo INTEGER DEFAULT 1
                    )
                `)

                db.run(`
                    CREATE TABLE vagas (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        barbeiro_id INTEGER NOT NULL,
                        inicio DATETIME NOT NULL,
                        fim DATETIME NOT NULL,
                        status TEXT NOT NULL DEFAULT 'DISPONIVEL' CHECK (status IN ('DISPONIVEL','RESERVADO','BLOQUEADO')),
                        FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id)
                    )
                `)

                db.run(`INSERT INTO barbeiros (id, nome_profissional) VALUES (1, 'Barbeiro Teste')`, (err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })
        })
    })

    describe('criarVagasParaBarbeiro', () => {
        it('deve inserir vagas no banco de dados', async () => {
            await vagasRepository.criarVagasParaBarbeiro(1, '2026-02-01', '10:00', '12:00', 60)

            const vagas = await vagasRepository.buscarTodasPorBarbeiroEData(1, '2026-02-01')
            
            expect(vagas).to.have.lengthOf(2)
            expect(vagas[0].inicio).to.include('10:00')
            expect(vagas[0].status).to.equal(StatusVaga.DISPONIVEL)
        })
    })

    describe('atualizarStatusLote', () => {
        it('deve atualizar o status de múltiplas vagas', async () => {
            await new Promise<void>((resolve) => {
                db.run(`INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES 
                    (1, '2026-02-01T10:00:00.000Z', '2026-02-01T10:30:00.000Z', 'DISPONIVEL')`, resolve)
            })

            const vagas = await vagasRepository.buscarTodasPorBarbeiroEData(1, '2026-02-01')
            const idParaAtualizar = vagas[0].id

            await vagasRepository.atualizarStatusLote([idParaAtualizar], StatusVaga.RESERVADO)

            const vagasAtualizadas = await vagasRepository.buscarTodasPorBarbeiroEData(1, '2026-02-01')
            expect(vagasAtualizadas[0].status).to.equal(StatusVaga.RESERVADO)
        })
    })

    describe('bloquearIntervalo', () => {
        it('deve atualizar o status de vagas para Bloqueado', async () => {
            await new Promise<void>((resolve) => {
                db.run(`INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES 
                    (1, '2026-02-01T10:00:00.000Z', '2026-02-01T10:30:00.000Z', 'DISPONIVEL')`, resolve)
            })

            await vagasRepository.bloquearIntervalo(1, '2026-02-01T10:00:00.000Z', '2026-02-01T10:30:00.000Z')
            
            const vagasAtualizadas = await vagasRepository.buscarTodasPorBarbeiroEData(1, '2026-02-01')
            expect(vagasAtualizadas[0].status).to.equal(StatusVaga.BLOQUEADO)
        })
    })

    describe('Cenários de Erro', () => {
        it('deve lançar erro ao tentar criar vagas se a tabela não existir', async () => {
            // Sabotagem
            await new Promise<void>((resolve) => db.run("DROP TABLE vagas", () => resolve()))

            try {
                await vagasRepository.criarVagasParaBarbeiro(1, '2026-02-01', '10:00', '11:00', 60)
                expect.fail('Deveria ter falhado')
            } catch (err: any) {
                expect(err).to.exist
            }
        })
    })
})