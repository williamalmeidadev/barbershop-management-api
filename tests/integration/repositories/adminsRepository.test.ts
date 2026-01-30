
import { expect } from 'chai';
import { adminsRepository } from '../../../src/repositories/adminsRepository';
import { db } from '../../../src/database/sqlite';
import { initDatabase } from '../../../src/database/init';

describe('AdminsRepository Integration', function () {
    this.timeout(5000);

    // Setup inicial do banco de dados
    before((done) => {
        initDatabase();
        // Aguarda a criação das tabelas
        db.get('SELECT 1', (err) => {
            if (err) done(err);
            else done();
        });
    });

    // Limpeza robusta entre testes
    beforeEach(async () => {
        await new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.run('PRAGMA foreign_keys = OFF');
                db.run('DELETE FROM admins');
                db.run('PRAGMA foreign_keys = ON', (err) => {
                    if (err) reject(err); else resolve();
                });
            });
        });
    });

    describe('create', () => {
        it('deve inserir admin e retornar ID numérico', async () => {
            const payload = {
                usuario: 'admin_test',
                nome: 'Admin Teste',
                email: 'admin@test.com',
                password_hash: 'hashed_password'
            };

            const adminId = await adminsRepository.create(payload);
            expect(adminId).to.be.a('number');

            // Verifica persistência
            const saved = await adminsRepository.findByEmailOrUsuario('', 'admin_test');
            expect(saved).to.not.be.null;
            expect(saved!.id).to.equal(adminId);
        });

        it('deve lançar erro de constraint ao duplicar e-mail', async () => {
            await adminsRepository.create({
                usuario: 'admin1',
                nome: 'A1',
                email: 'dup@test.com',
                password_hash: 'h'
            });

            try {
                await adminsRepository.create({
                    usuario: 'admin2',
                    nome: 'A2',
                    email: 'dup@test.com', // Mesmo email
                    password_hash: 'h'
                });
                expect.fail('Haveria de lançar erro de constraint (email)');
            } catch (err: any) {
                expect(err.message).to.contain('SQLITE_CONSTRAINT');
            }
        });

        it('deve lançar erro de constraint ao duplicar usuário', async () => {
            await adminsRepository.create({
                usuario: 'dup_user',
                nome: 'A1',
                email: 'a1@test.com',
                password_hash: 'h'
            });

            try {
                await adminsRepository.create({
                    usuario: 'dup_user', // Mesmo usuario
                    nome: 'A2',
                    email: 'a2@test.com',
                    password_hash: 'h'
                });
                expect.fail('Haveria de lançar erro de constraint (usuario)');
            } catch (err: any) {
                expect(err.message).to.contain('SQLITE_CONSTRAINT');
            }
        });
    });

    describe('findByEmailOrUsuario', () => {
        beforeEach(async () => {
            await adminsRepository.create({
                usuario: 'target_user',
                nome: 'Target',
                email: 'target@test.com',
                password_hash: 'h'
            });
        });

        it('deve encontrar pelo email exato', async () => {
            const res = await adminsRepository.findByEmailOrUsuario('target@test.com', 'random');
            expect(res).to.not.be.null;
        });

        it('deve encontrar pelo usuário exato', async () => {
            const res = await adminsRepository.findByEmailOrUsuario('random@test.com', 'target_user');
            expect(res).to.not.be.null;
        });

        it('deve retornar null se nenhum coincidir', async () => {
            const res = await adminsRepository.findByEmailOrUsuario('fake@test.com', 'fake_user');
            expect(res).to.be.null;
        });
    });

    describe('findLoginByEmail', () => {
        it('deve retornar objeto com password_hash e ativo', async () => {
            await adminsRepository.create({
                usuario: 'login_user',
                nome: 'Login',
                email: 'login@test.com',
                password_hash: 'hash_secreto'
            });

            const res = await adminsRepository.findLoginByEmail('login@test.com');
            expect(res).to.not.be.null;
            expect(res!.email).to.equal('login@test.com');
            expect(res!.password_hash).to.equal('hash_secreto');
            expect(res!.ativo).to.be.oneOf([0, 1]);
        });

        it('deve retornar null para email inexistente', async () => {
            const res = await adminsRepository.findLoginByEmail('ghost@test.com');
            expect(res).to.be.null;
        });
    });
});
