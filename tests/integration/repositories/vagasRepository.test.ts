
import { expect } from 'chai';
import { vagasRepository } from '../../../src/repositories/vagasRepository';
import { db } from '../../../src/database/sqlite';
import { initDatabase } from '../../../src/database/init';
import { StatusVaga } from '../../../src/interfaces/vaga';

describe('VagasRepository Integration', function () {
    this.timeout(5000);

    let barbeiroId: number;

    before((done) => {
        initDatabase();
        db.get('SELECT 1', (err) => {
            if (err) done(err);
            else done();
        });
    });

    beforeEach(async () => {
        await clearTables();
        await seedDatabase();
    });

    async function clearTables() {
        // Order matters due to FKs
        const tables = ['agendamento_servicos', 'agendamento_vagas', 'agendamentos', 'vagas', 'servicos', 'barbeiros', 'clientes'];
        for (const table of tables) {
            await new Promise<void>((resolve, reject) => {
                db.run(`DELETE FROM ${table}`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
    }

    async function seedDatabase() {
        // Insert Barbeiro
        barbeiroId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO barbeiros (nome_profissional, ativo) VALUES ('Barb Teste', 1)`, function (err) {
                if (err) reject(err); else resolve(this.lastID);
            });
        });
    }

    describe('A. Geração de Agenda (Happy Path)', () => {
        it('deve criar vagas para o barbeiro no intervalo especificado', async () => {
            const data = '2026-01-30';
            const inicioExpediente = '09:00';
            const fimExpediente = '10:00';
            const duracaoVaga = 30;

            const vagas = await vagasRepository.criarVagasParaBarbeiro(barbeiroId, data, inicioExpediente, fimExpediente, duracaoVaga);

            expect(vagas).to.have.lengthOf(2);

            // Verificando horários UTC
            const v1 = vagas[0];
            const v2 = vagas[1];

            // Assert against runtime timezone conversion used by Date constructor.
            const expectedStart = new Date(`${data}T${inicioExpediente}:00`).toISOString();
            const expectedMid = new Date(`${data}T09:30:00`).toISOString();
            const expectedEnd = new Date(`${data}T${fimExpediente}:00`).toISOString();

            expect(v1.inicio).to.equal(expectedStart);
            expect(v1.fim).to.equal(expectedMid);
            expect(v1.status).to.equal(StatusVaga.DISPONIVEL);

            expect(v2.inicio).to.equal(expectedMid);
            expect(v2.fim).to.equal(expectedEnd);
        });
    });

    describe('B. Verificação de Disponibilidade', () => {
        it('deve retornar apenas vagas DISPONIVEIS', async () => {
            const data = '2026-01-30';
            // Insert 3 vagas with different statuses
            await insertVaga(barbeiroId, '2026-01-30T08:00:00.000Z', '2026-01-30T08:30:00.000Z', StatusVaga.DISPONIVEL);
            await insertVaga(barbeiroId, '2026-01-30T08:30:00.000Z', '2026-01-30T09:00:00.000Z', StatusVaga.RESERVADO);
            await insertVaga(barbeiroId, '2026-01-30T09:00:00.000Z', '2026-01-30T09:30:00.000Z', StatusVaga.BLOQUEADO);

            const disponiveis = await vagasRepository.buscarDisponiveisPorBarbeiroEData(barbeiroId, data);

            expect(disponiveis).to.have.lengthOf(1);
            expect(disponiveis[0].inicio).to.equal('2026-01-30T08:00:00.000Z');
        });
    });

    describe('C. Reserva e Concorrência', () => {
        it('deve atualizar status de um lote de vagas', async () => {
            const id1 = await insertVaga(barbeiroId, '2026-01-30T10:00:00.000Z', '2026-01-30T10:30:00.000Z', StatusVaga.DISPONIVEL);
            const id2 = await insertVaga(barbeiroId, '2026-01-30T10:30:00.000Z', '2026-01-30T11:00:00.000Z', StatusVaga.DISPONIVEL);

            await vagasRepository.atualizarStatusLote([id1, id2], StatusVaga.RESERVADO);

            const v1 = await getVagaById(id1);
            const v2 = await getVagaById(id2);

            expect(v1.status).to.equal(StatusVaga.RESERVADO);
            expect(v2.status).to.equal(StatusVaga.RESERVADO);
        });
    });

    describe('D. Bloqueio de Intervalo', () => {
        it('deve bloquear vagas dentro do intervalo e manter as de fora', async () => {
            // Vaga antes (Manter)
            const vAntes = await insertVaga(barbeiroId, '2026-01-30T13:00:00.000Z', '2026-01-30T13:30:00.000Z', StatusVaga.DISPONIVEL);
            // Vaga dentro (Bloquear)
            const vDentro1 = await insertVaga(barbeiroId, '2026-01-30T14:00:00.000Z', '2026-01-30T14:30:00.000Z', StatusVaga.DISPONIVEL);
            const vDentro2 = await insertVaga(barbeiroId, '2026-01-30T15:30:00.000Z', '2026-01-30T16:00:00.000Z', StatusVaga.DISPONIVEL);
            // Vaga depois (Manter)
            const vDepois = await insertVaga(barbeiroId, '2026-01-30T16:00:00.000Z', '2026-01-30T16:30:00.000Z', StatusVaga.DISPONIVEL);

            await vagasRepository.bloquearIntervalo(barbeiroId, '2026-01-30T14:00:00.000Z', '2026-01-30T16:00:00.000Z');

            expect((await getVagaById(vAntes)).status).to.equal(StatusVaga.DISPONIVEL);
            expect((await getVagaById(vDentro1)).status).to.equal(StatusVaga.BLOQUEADO);
            expect((await getVagaById(vDentro2)).status).to.equal(StatusVaga.BLOQUEADO);
            expect((await getVagaById(vDepois)).status).to.equal(StatusVaga.DISPONIVEL);
        });
    });

    describe('E. Proteção de Deleção', () => {
        it('deve retornar true se a vaga tiver agendamento vinculado', async () => {
            const vagaId = await insertVaga(barbeiroId, '2026-01-30T14:00:00.000Z', '2026-01-30T14:30:00.000Z', StatusVaga.DISPONIVEL);

            // Need a client to create an agendamento
            const clienteId = await new Promise<number>((resolve, reject) => {
                db.run(`INSERT INTO clientes (nome, email, password_hash) VALUES ('Cli', 'cli@t.com', 'h')`, function (err) {
                    if (err) reject(err); else resolve(this.lastID);
                });
            });

            // Create Agendamento
            const agendamentoId = await new Promise<number>((resolve, reject) => {
                db.run(`INSERT INTO agendamentos (cliente_id, barbeiro_id, inicio, fim, status) VALUES (?, ?, 'date', 'date', 'AGENDADO')`,
                    [clienteId, barbeiroId], function (err) {
                        if (err) reject(err); else resolve(this.lastID);
                    });
            });

            // Link Agendamento to Vaga
            await new Promise<void>((resolve, reject) => {
                db.run(`INSERT INTO agendamento_vagas (agendamento_id, vaga_id) VALUES (?, ?)`, [agendamentoId, vagaId], (err) => {
                    if (err) reject(err); else resolve();
                });
            });

            const temAgendamento = await vagasRepository.verificarAgendamentoNaVaga(vagaId);
            expect(temAgendamento).to.be.true;
        });

        it('deve retornar false se a vaga não tiver agendamento', async () => {
            const vagaId = await insertVaga(barbeiroId, '2026-01-30T14:00:00.000Z', '2026-01-30T14:30:00.000Z', StatusVaga.DISPONIVEL);
            const temAgendamento = await vagasRepository.verificarAgendamentoNaVaga(vagaId);
            expect(temAgendamento).to.be.false;
        });
    });

    describe('F. Helpers Diversos', () => {
        it('deve buscar vagas por IDs', async () => {
            const id1 = await insertVaga(barbeiroId, '2026-01-30T10:00:00.000Z', '2026-01-30T10:30:00.000Z', StatusVaga.DISPONIVEL);
            const id2 = await insertVaga(barbeiroId, '2026-01-30T11:00:00.000Z', '2026-01-30T11:30:00.000Z', StatusVaga.DISPONIVEL);

            const encontradas = await vagasRepository.buscarVagasPorIds([id1, id2]);
            expect(encontradas).to.have.lengthOf(2);
            const ids = encontradas.map(v => v.id);
            expect(ids).to.include(id1);
            expect(ids).to.include(id2);
        });

        it('deve buscar vagas consecutivas', async () => {
            const h1000 = '2026-01-30T10:00:00.000Z';
            const h1030 = '2026-01-30T10:30:00.000Z';
            const h1100 = '2026-01-30T11:00:00.000Z';

            await insertVaga(barbeiroId, h1000, h1030, StatusVaga.DISPONIVEL);
            await insertVaga(barbeiroId, h1030, h1100, StatusVaga.DISPONIVEL);
            await insertVaga(barbeiroId, h1100, '2026-01-30T11:30:00.000Z', StatusVaga.DISPONIVEL);

            const consecutivas = await vagasRepository.buscarVagasConsecutivas(barbeiroId, h1000, 2);
            expect(consecutivas).to.have.lengthOf(2);
            expect(consecutivas[0].inicio).to.equal(h1000);
            expect(consecutivas[1].inicio).to.equal(h1030);
        });

        it('deve apagar uma vaga', async () => {
            const id = await insertVaga(barbeiroId, '2026-01-30T09:00:00.000Z', '2026-01-30T09:30:00.000Z', StatusVaga.DISPONIVEL);

            const sucesso = await vagasRepository.apagarVaga(id);
            expect(sucesso).to.be.true;

            const buscada = await getVagaById(id);
            expect(buscada).to.be.undefined;
        });

        it('deve liberar vagas reservadas', async () => {
            const id = await insertVaga(barbeiroId, '2026-01-30T09:00:00.000Z', '2026-01-30T09:30:00.000Z', StatusVaga.RESERVADO);

            await vagasRepository.liberarVagas([id]);

            const v = await getVagaById(id);
            expect(v.status).to.equal(StatusVaga.DISPONIVEL);
        });
    });

    // Helpers
    async function insertVaga(barbeiroId: number, inicio: string, fim: string, status: StatusVaga): Promise<number> {
        return await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES (?, ?, ?, ?)`,
                [barbeiroId, inicio, fim, status], function (err) {
                    if (err) reject(err); else resolve(this.lastID);
                });
        });
    }

    async function getVagaById(id: number): Promise<any> {
        return await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM vagas WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err); else resolve(row);
            });
        });
    }
});
