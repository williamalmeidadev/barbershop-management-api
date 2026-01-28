import { expect } from 'chai'
import { db } from '../../src/database/sqlite' 
import { slotRepository } from '../../src/repositories/slotRepository'
import { SlotStatus } from '../../src/interfaces/slot'

describe('SlotRepository (Integração)', () => {
    
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

    describe('createSlotsForBarbeiro', () => {
        it('deve inserir slots no banco de dados', async () => {
            await slotRepository.createSlotsForBarbeiro(1, '2026-02-01', '10:00', '12:00', 60)

            const slots = await slotRepository.findTodosByBarbeiroEData(1, '2026-02-01')
            
            expect(slots).to.have.lengthOf(2)
            expect(slots[0].inicio).to.include('10:00')
            expect(slots[0].status).to.equal(SlotStatus.DISPONIVEL)
        })
    })

    describe('updateStatusLote', () => {
        it('deve atualizar o status de múltiplos slots', async () => {
            await new Promise<void>((resolve) => {
                db.run(`INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES 
                    (1, '2026-02-01T10:00:00.000Z', '2026-02-01T10:30:00.000Z', 'DISPONIVEL')`, resolve)
            })

            const slots = await slotRepository.findTodosByBarbeiroEData(1, '2026-02-01')
            const idParaAtualizar = slots[0].id

            await slotRepository.updateStatusLote([idParaAtualizar], SlotStatus.RESERVADO)

            const slotsAtualizados = await slotRepository.findTodosByBarbeiroEData(1, '2026-02-01')
            expect(slotsAtualizados[0].status).to.equal(SlotStatus.RESERVADO)
        })
    })

    describe('bloquearIntervalo', () => {
        it('deve atualizar o status de múltiplos slots para Bloqueado', async () => {
            await new Promise<void>((resolve) => {
                db.run(`INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES 
                    (1, '2026-02-01T10:00:00.000Z', '2026-02-01T10:30:00.000Z', 'DISPONIVEL')`, resolve)
            })

            const slots = await slotRepository.findTodosByBarbeiroEData(1, '2026-02-01')

            await slotRepository.bloquearIntervalo(1, '2026-02-01T10:00:00.000Z', '2026-02-01T10:30:00.000Z')
            
            const slotsAtualizados = await slotRepository.findTodosByBarbeiroEData(1, '2026-02-01')
            expect(slotsAtualizados[0].status).to.equal(SlotStatus.BLOQUEADO)
        })
    })
})