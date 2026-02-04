
import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import { adminsService } from '../../../src/services/adminsService';
import { adminsRepository } from '../../../src/repositories/adminsRepository';

describe('AdminsService', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('criar', () => {
        const validPayload = {
            usuario: 'adminUser',
            nome: 'Admin Teste',
            email: 'admin@test.com',
            password: 'SenhaSegura123'
        };

        it('deve criar um admin com sucesso (senha hashada)', async () => {
            const hashStub = sandbox.stub(bcrypt, 'hash').resolves('hash_seguro' as any);
            const createStub = sandbox.stub(adminsRepository, 'create').resolves(1);
            sandbox.stub(adminsRepository, 'findByEmailOrUsuario').resolves(null);

            const result = await adminsService.criar(validPayload);

            expect(result).to.deep.equal({ adminId: 1 });
            sinon.assert.calledWith(hashStub, validPayload.password, 10);
            sinon.assert.calledWith(createStub, sinon.match({
                usuario: validPayload.usuario,
                nome: validPayload.nome,
                email: validPayload.email,
                password_hash: 'hash_seguro'
            }));
        });

        it('deve lançar erro se campos obrigatórios estiverem faltando', async () => {
            const payloads = [
                { ...validPayload, usuario: '' },
                { ...validPayload, nome: '' },
                { ...validPayload, password: '' }
            ];

            for (const payload of payloads) {
                try {
                    await adminsService.criar(payload);
                    expect.fail('Should have thrown error');
                } catch (err: any) {
                    expect(err.message).to.contain('Usuário, nome e senha são obrigatórios');
                }
            }
        });

        it('deve lançar erro se o e-mail for inválido', async () => {
            try {
                await adminsService.criar({ ...validPayload, email: 'email-invalido' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('E-mail inválido');
            }
        });

        it('deve lançar erro se o admin já existir (usuário ou email)', async () => {
            sandbox.stub(adminsRepository, 'findByEmailOrUsuario').resolves({ id: 99 } as any);

            try {
                await adminsService.criar(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Admin já existe com esse usuário ou email');
            }
        });

        it('deve lançar erro se a senha for fraca', async () => {
            const findStub = sandbox.stub(adminsRepository, 'findByEmailOrUsuario');
            const createStub = sandbox.stub(adminsRepository, 'create');
            try {
                await adminsService.criar({ ...validPayload, password: 'fraca1' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Senha fraca');
                sinon.assert.notCalled(findStub);
                sinon.assert.notCalled(createStub);
            }
        });

        it('deve aceitar senha forte com 6 caracteres (regra mínima)', async () => {
            const hashStub = sandbox.stub(bcrypt, 'hash').resolves('hash_minimo' as any);
            sandbox.stub(adminsRepository, 'findByEmailOrUsuario').resolves(null);
            const createStub = sandbox.stub(adminsRepository, 'create').resolves(2);

            const payload = { ...validPayload, password: 'Aa1bbb' };
            const result = await adminsService.criar(payload);

            expect(result).to.deep.equal({ adminId: 2 });
            sinon.assert.calledWith(hashStub, payload.password, 10);
            sinon.assert.calledOnce(createStub);
        });
    });
});
