
import request from 'supertest';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import net from 'net';
import app from '../../../src/app';
import { db } from '../../../src/database/sqlite';
import { initDatabase } from '../../../src/database/init';

describe('Agendamentos Route Integration (E2E)', function () {
    this.timeout(5000);

    const TEST_SECRET = 'test-secret';
    let token: string;
    let clienteId: number;
    let barbeiroId: number;
    let servicoId: number;
    let canBindSocket = true;
    // Data/Hora para o teste
    const dataAgendamento = '2026-08-20';
    const horaInicio = '10:00';
    const horaFim = '10:30';

    before((done) => {
        process.env.JWT_SECRET = TEST_SECRET;
        initDatabase();
        db.get('SELECT 1', (err) => {
            if (err) done(err);
            else {
                const probe = net.createServer();
                probe.once('error', () => {
                    canBindSocket = false;
                    done();
                });
                probe.listen(0, '127.0.0.1', () => {
                    probe.close(() => done());
                });
            }
        });
    });

    after(() => {
        delete process.env.JWT_SECRET;
    });

    beforeEach(async () => {
        if (!canBindSocket) return;
        await clearTables();
        await seedDatabase();

        // Generate valid token for the seeded client
        token = jwt.sign({ id: clienteId, role: 'client', email: 'teste@e2e.com' }, TEST_SECRET, { expiresIn: '1h' });
    });

    beforeEach(function () {
        if (!canBindSocket) this.skip();
    });

    async function clearTables() {
        const tables = ['agendamento_servicos', 'agendamento_vagas', 'agendamentos', 'vagas', 'servicos', 'barbeiros', 'clientes'];
        for (const table of tables) {
            await new Promise<void>((resolve, reject) => {
                db.run(`DELETE FROM ${table}`, (err) => {
                    if (err) reject(err); else resolve();
                });
            });
        }
    }

    async function seedDatabase() {
        // 1. Create Barber
        barbeiroId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO barbeiros (nome_profissional, ativo) VALUES ('Barbeiro E2E', 1)`, function (err) {
                if (err) reject(err); else resolve(this.lastID);
            });
        });

        // 2. Create Client
        clienteId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO clientes (nome, email, password_hash) VALUES ('Cliente E2E', 'teste@e2e.com', 'hash')`, function (err) {
                if (err) reject(err); else resolve(this.lastID);
            });
        });

        // 3. Create Service
        servicoId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO servicos (nome, duracao_minutos, preco_centavos, ativo, barbeiro_id) VALUES ('Corte E2E', 30, 5000, 1, ?)`, [barbeiroId], function (err) {
                if (err) reject(err); else resolve(this.lastID);
            });
        });

        // 4. Create Vaga (Need to match the requested time exactly in UTC if the repo uses strict equality)
        // Adjusting logic: The app likely converts inputs to UTC. 
        // For simplicity in E2E, we insert a 'DISPONIVEL' vaga that matches what the controller will look for.
        // Assuming the controller/repo logic expects UTC strings in DB.
        // Let's rely on standard ISO strings. 10:00 local might be diff, but let's assume UTC for test consistency unless app handles timezone conversion explicitly.
        // The previous tests used strict string matching '2026-01-30T09:00:00.000Z'.
        // Let's insert a vaga exactly matching the payload we will send, assuming the backend constructs it as 'YYYY-MM-DDTHH:mm:00.000Z'

        const inicioIso = `${dataAgendamento}T${horaInicio}:00.000Z`;
        const fimIso = `${dataAgendamento}T${horaFim}:00.000Z`;

        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT INTO vagas (barbeiro_id, inicio, fim, status) VALUES (?, ?, ?, 'DISPONIVEL')`,
                [barbeiroId, inicioIso, fimIso], (err) => {
                    if (err) reject(err); else resolve();
                });
        });
    }

    it('POST /agendamentos - deve criar agendamento com sucesso (201)', async () => {
        const inicioIso = `${dataAgendamento}T${horaInicio}:00.000Z`;

        const payload = {
            cliente_id: clienteId,
            barbeiro_id: barbeiroId,
            servicos: [servicoId],
            inicio_desejado: inicioIso
        };

        const res = await request(app)
            .post('/agendamentos')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);

        // Debug output in case of failure
        if (res.status !== 201) {
            console.error('Test Failed Response Body:', res.body);
        }

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('status', 'SOLICITADO');
        expect(res.body).to.have.property('cliente_id', clienteId);
        expect(res.body).to.have.property('barbeiro_id', barbeiroId);
    });
});
