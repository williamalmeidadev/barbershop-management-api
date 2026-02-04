
import request from 'supertest';
import express, { Request, Response } from 'express';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import net from 'net';
import { verifyToken } from '../../../src/middlewares/verifyToken';
import { isAdmin } from '../../../src/middlewares/verifyAdmin';

describe('Auth Middlewares Integration', () => {
    let app: express.Express;
    const TEST_SECRET = 'test-secret';
    let canBindSocket = true;

    before((done) => {
        process.env.JWT_SECRET = TEST_SECRET;

        app = express();
        app.use(express.json());

        // Rotas de teste
        app.get('/protected', verifyToken, (req: Request, res: Response) => {
            res.status(200).json({ user: req.user });
        });

        app.get('/admin', verifyToken, isAdmin, (req: Request, res: Response) => {
            res.status(200).json({ message: 'Admin access granted' });
        });

        const probe = net.createServer();
        probe.once('error', () => {
            canBindSocket = false;
            done();
        });
        probe.listen(0, '127.0.0.1', () => {
            probe.close(() => done());
        });
    });

    after(() => {
        delete process.env.JWT_SECRET;
    });

    beforeEach(function () {
        if (!canBindSocket) this.skip();
    });

    describe('verifyToken', () => {
        it('deve retornar 401 se o token não for fornecido', async () => {
            const res = await request(app).get('/protected');
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'Token não fornecido.');
        });

        it('deve retornar 401 se o formato do token for inválido (sem Bearer)', async () => {
            const res = await request(app)
                .get('/protected')
                .set('Authorization', 'InvalidFormatToken');

            // O código atual faz split(' '), 'InvalidFormatToken'.split(' ') gera ['InvalidFormatToken']
            // token = undefined (index 1). jwt.verify(undefined) vai lançar erro.
            // O comportamento esperado é cair no catch e retornar 401.
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error');
        });

        it('deve retornar 401 se a assinatura do token for inválida', async () => {
            const token = jwt.sign({ id: 1, role: 'client' }, 'wrong-secret');
            const res = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'Token inválido.');
        });

        it('deve retornar 200 e popular req.user se o token for válido', async () => {
            const payload = { id: 123, email: 'test@test.com', role: 'client' };
            const token = jwt.sign(payload, TEST_SECRET);

            const res = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.user).to.include(payload);
        });
    });

    describe('isAdmin', () => {
        it('deve retornar 403 se o usuário não for admin', async () => {
            const token = jwt.sign({ id: 1, role: 'client' }, TEST_SECRET);

            const res = await request(app)
                .get('/admin')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('error').that.includes('Acesso negado');
        });

        it('deve retornar 200 se o usuário for admin', async () => {
            const token = jwt.sign({ id: 2, role: 'admin' }, TEST_SECRET);

            const res = await request(app)
                .get('/admin')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'Admin access granted');
        });
    });
});
