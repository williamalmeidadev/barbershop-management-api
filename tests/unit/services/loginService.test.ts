
import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginService } from '../../../src/services/loginService';
import { clientesRepository } from '../../../src/repositories/clientesRepository';
import { adminsRepository } from '../../../src/repositories/adminsRepository';

describe('LoginService', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('loginCliente', () => {
        const validPayload = { email: 'client@test.com', password: 'password123' };

        it('deve retornar um token após o login bem-sucedido', async () => {
            const mockCliente = {
                id: 1,
                email: 'client@test.com',
                password_hash: 'hash',
                ativo: 1,
                is_verified: 1
            };

            sandbox.stub(clientesRepository, 'findLoginByEmail').resolves(mockCliente as any);
            sandbox.stub(bcrypt, 'compare').resolves(true as any);
            const jwtSignStub = sandbox.stub(jwt, 'sign').returns('mock-token' as any);

            const result = await loginService.loginCliente(validPayload);

            expect(result).to.have.property('token', 'mock-token');
            sinon.assert.calledWith(jwtSignStub,
                sinon.match({ id: 1, email: 'client@test.com', role: 'cliente' }),
                sinon.match.any,
                sinon.match.any
            );
        });

        it('deve exibir um erro se o e-mail ou a senha estiverem ausentes.', async () => {
            try {
                await loginService.loginCliente({ email: '', password: '' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Email e senha são obrigatórios');
            }
        });

        it('deve gerar um erro se o usuário não for encontrado.', async () => {
            sandbox.stub(clientesRepository, 'findLoginByEmail').resolves(null);

            try {
                await loginService.loginCliente(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Credenciais inválidas');
            }
        });

        it('deve gerar um erro se o usuário estiver inativo.', async () => {
            sandbox.stub(clientesRepository, 'findLoginByEmail').resolves({
                id: 1,
                email: 'client@test.com',
                password_hash: 'hash',
                ativo: 0
            } as any);

            try {
                await loginService.loginCliente(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Usuário inativo');
            }
        });

        it('deve gerar um erro se o e-mail não for verificado.', async () => {
            sandbox.stub(clientesRepository, 'findLoginByEmail').resolves({
                id: 1,
                email: 'client@test.com',
                password_hash: 'hash',
                ativo: 1,
                is_verified: 0
            } as any);

            try {
                await loginService.loginCliente(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Email não verificado');
            }
        });

        it('deve gerar um erro se a senha for inválida.', async () => {
            sandbox.stub(clientesRepository, 'findLoginByEmail').resolves({
                id: 1,
                email: 'client@test.com',
                password_hash: 'hash',
                ativo: 1,
                is_verified: 1
            } as any);
            sandbox.stub(bcrypt, 'compare').resolves(false as any);

            try {
                await loginService.loginCliente(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Credenciais inválidas');
            }
        });
    });

    describe('loginAdmin', () => {
        const validPayload = { email: 'admin@test.com', password: 'adminpass' };

        it('deve retornar um token após o login bem-sucedido', async () => {
            const mockAdmin = {
                id: 99,
                email: 'admin@test.com',
                password_hash: 'adminhash',
                ativo: 1
            };

            sandbox.stub(adminsRepository, 'findLoginByEmail').resolves(mockAdmin as any);
            sandbox.stub(bcrypt, 'compare').resolves(true as any);
            const jwtSignStub = sandbox.stub(jwt, 'sign').returns('admin-token' as any);

            const result = await loginService.loginAdmin(validPayload);

            expect(result).to.have.property('token', 'admin-token');
            sinon.assert.calledWith(jwtSignStub,
                sinon.match({ id: 99, email: 'admin@test.com', role: 'admin' }),
                sinon.match.any,
                sinon.match.any
            );
        });

        it('deve exibir um erro se o e-mail ou a senha estiverem ausentes.', async () => {
            try {
                await loginService.loginAdmin({ email: '', password: '' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Email e senha são obrigatórios');
            }
        });

        it('deve gerar um erro se o administrador não for encontrado.', async () => {
            sandbox.stub(adminsRepository, 'findLoginByEmail').resolves(null);

            try {
                await loginService.loginAdmin(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Credenciais inválidas');
            }
        });

        it('deve gerar um erro se o administrador estiver inativo.', async () => {
            sandbox.stub(adminsRepository, 'findLoginByEmail').resolves({
                id: 99,
                email: 'admin@test.com',
                password_hash: 'hash',
                ativo: 0
            } as any);

            try {
                await loginService.loginAdmin(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Administrador inativo');
            }
        });

        it('deve gerar um erro se a senha for inválida.', async () => {
            sandbox.stub(adminsRepository, 'findLoginByEmail').resolves({
                id: 99,
                email: 'admin@test.com',
                password_hash: 'hash',
                ativo: 1
            } as any);
            sandbox.stub(bcrypt, 'compare').resolves(false as any);

            try {
                await loginService.loginAdmin(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Credenciais inválidas');
            }
        });
    });
});
