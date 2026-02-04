
import { expect } from 'chai';
import { agendamentosRepository } from '../../../src/repositories/agendamentosRepository';
import { db } from '../../../src/database/sqlite';
import { initDatabase } from '../../../src/database/init';
import { StatusAgendamento } from '../../../src/interfaces/agendamento';
import { Vaga, StatusVaga } from '../../../src/interfaces/vaga';

describe('AgendamentosRepository Integration', function () {
    this.timeout(5000);

    let clienteId: number;
    let barbeiroId: number;
    let servicoIds: number[] = [];
    let vagaIds: number[] = [];
    let vagas: Vaga[] = [];

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
        const tables = ['agendamento_vagas', 'agendamento_servicos', 'agendamentos', 'vagas', 'servicos', 'barbeiros', 'clientes'];
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
        // Cliente
        clienteId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO clientes (nome, email, password_hash) VALUES ('Cli', 'c@t.com', 'h')`, function (err) {
                if (err) reject(err); else resolve(this.lastID);
            });
        });

        // Barbeiro
        barbeiroId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO barbeiros (nome_profissional, ativo) VALUES ('Barb', 1)`, function (err) {
                if (err) reject(err); else resolve(this.lastID);
            });
        });

        // Servicos (2)
        servicoIds = [];
        for (let i = 1; i <= 2; i++) {
            const id = await new Promise<number>((resolve, reject) => {
                db.run(`INSERT INTO servicos (nome, duracao_minutos, preco_centavos, barbeiro_id) VALUES ('S${i}', 30, 1000, ?)`, [barbeiroId], function (err) {
                    if (err) reject(err); else resolve(this.lastID);
                });
            });
            servicoIds.push(id);
        }

        // Vagas (2)
        vagaIds = [];
        vagas = [];
        const times = [['2023-10-10 10:00', '2023-10-10 10:30'], ['2023-10-10 10:30', '2023-10-10 11:00']];
        for (const t of times) {
            const id = await new Promise<number>((resolve, reject) => {
                db.run(`INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES (?, ?, ?, ?)`,
                    [barbeiroId, t[0], t[1], StatusVaga.DISPONIVEL], function (err) {
                        if (err) reject(err); else resolve(this.lastID);
                    });
            });
            vagaIds.push(id);
            vagas.push({ id, barbeiro_id: barbeiroId, inicio: t[0], fim: t[1], status: StatusVaga.DISPONIVEL });
        }
    }

    describe('Fluxo de Criação Completo', () => {
        it('deve criar agendamento, associar serviços e vagas, e retornar completo', async () => {
            const agendamentoId = await agendamentosRepository.criarAgendamento({
                cliente_id: clienteId,
                barbeiro_id: barbeiroId,
                inicio: '2023-10-10 10:00',
                fim: '2023-10-10 11:00',
                status: StatusAgendamento.AGENDADO,
                valor_original_centavos: 2000,
                desconto_aplicado_centavos: 0,
                valor_total_centavos: 2000
            });

            const servicosPayload = servicoIds.map((id) => ({
                id,
                preco_centavos: 1000,
                duracao_minutos: 30
            }));

            await agendamentosRepository.adicionarServicosAoAgendamento(agendamentoId, servicosPayload);
            await agendamentosRepository.adicionarVagasAoAgendamento(agendamentoId, vagas);

            const completo = await agendamentosRepository.buscarAgendamentoCompleto(agendamentoId);

            expect(completo).to.not.be.null;
            expect(completo!.id).to.equal(agendamentoId);
            expect(completo!.barbeiro!.id).to.equal(barbeiroId);
            expect(completo!.servicos).to.have.lengthOf(2);
            expect(completo!.vagas).to.have.lengthOf(2);
            expect(completo!.vagas[0].id).to.equal(vagaIds[0]);
        });
    });

    describe('Cancelar Agendamento', () => {
        it('deve cancelar e liberar vagas', async () => {
            const agId = await agendamentosRepository.criarAgendamento({
                cliente_id: clienteId,
                barbeiro_id: barbeiroId,
                inicio: '2023-10-10 10:00',
                fim: '2023-10-10 11:00',
                status: StatusAgendamento.AGENDADO,
                valor_original_centavos: 2000,
                desconto_aplicado_centavos: 0,
                valor_total_centavos: 2000
            });
            await agendamentosRepository.adicionarVagasAoAgendamento(agId, vagas);

            const placeholders = vagaIds.map(() => '?').join(',');
            await new Promise<void>((resolve, reject) => {
                db.run(`UPDATE vagas SET status = 'RESERVADO' WHERE id IN (${placeholders})`, vagaIds, (err) => {
                    if (err) reject(err); else resolve();
                });
            });

            await agendamentosRepository.cancelarAgendamento(agId, true);

            const atualizado = await agendamentosRepository.buscarAgendamentoPorId(agId);
            expect(atualizado!.status).to.equal(StatusAgendamento.CANCELADO);

            const vagasDb = await new Promise<any[]>((resolve, reject) => {
                db.all(`SELECT * FROM vagas WHERE id IN (${placeholders})`, vagaIds, (err, rows) => {
                    if (err) reject(err); else resolve(rows);
                });
            });

            vagasDb.forEach(v => expect(v.status).to.equal(StatusVaga.DISPONIVEL));
        });
    });

    describe('Concluir Agendamento', () => {
        it('deve concluir agendamento e definir data', async () => {
            const agId = await agendamentosRepository.criarAgendamento({
                cliente_id: clienteId,
                barbeiro_id: barbeiroId,
                inicio: '2023-10-10 10:00',
                fim: '2023-10-10 11:00',
                status: StatusAgendamento.AGENDADO,
                valor_original_centavos: 2000,
                desconto_aplicado_centavos: 0,
                valor_total_centavos: 2000
            });

            const dataConclusao = new Date().toISOString();
            await agendamentosRepository.concluirAgendamento(agId, dataConclusao);

            const atualizado = await agendamentosRepository.buscarAgendamentoPorId(agId);
            expect(atualizado!.status).to.equal(StatusAgendamento.CONCLUIDO);
            expect(atualizado!.concluido_em).to.equal(dataConclusao);
        });
    });

    describe('Listagem e Hidratação', () => {
        it('deve listar agendamentos com nested objects', async () => {
            const agId = await agendamentosRepository.criarAgendamento({
                cliente_id: clienteId,
                barbeiro_id: barbeiroId,
                inicio: '2023-10-10 10:00',
                fim: '2023-10-10 11:00',
                status: StatusAgendamento.AGENDADO,
                valor_original_centavos: 2000,
                desconto_aplicado_centavos: 0,
                valor_total_centavos: 2000
            });
            await agendamentosRepository.adicionarServicosAoAgendamento(agId, [{
                id: servicoIds[0], preco_centavos: 1000, duracao_minutos: 30
            }]);

            const lista = await agendamentosRepository.listarAgendamentosComServicosEVagas();
            expect(lista).to.have.lengthOf(1);
            expect(lista[0].servicos).to.have.lengthOf(1);
            expect(lista[0].servicos[0].servico_id).to.equal(servicoIds[0]);
        });
    });
});
