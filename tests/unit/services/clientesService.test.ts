
import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import { clientesService } from '../../../src/services/clientesService';
import { clientesRepository } from '../../../src/repositories/clientesRepository';

describe('ClientesService', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('criar', () => {
        const validPayload = {
            nome: 'Cliente Teste',
            email: 'cliente@teste.com',
            password: 'SenhaSegura123',
            telefone: '11999999999'
        };

        it('deve criar um cliente com sucesso (senha hashada)', async () => {
            const hashStub = sandbox.stub(bcrypt, 'hash').resolves('hash_seguro' as any);
            const createStub = sandbox.stub(clientesRepository, 'create').resolves(1);
            sandbox.stub(clientesRepository, 'findByEmail').resolves(null);

            const result = await clientesService.criar(validPayload);

            expect(result).to.deep.equal({ clienteId: 1 });
            sinon.assert.calledWith(hashStub, validPayload.password, 10);
            sinon.assert.calledWith(createStub, sinon.match({
                nome: validPayload.nome,
                email: validPayload.email,
                telefone: validPayload.telefone,
                password_hash: 'hash_seguro'
            }));
        });

        it('deve lançar erro se campos obrigatórios estiverem faltando', async () => {
            const payloads = [
                { ...validPayload, nome: '' },
                { ...validPayload, email: '' },
                { ...validPayload, password: '' }
            ];

            for (const payload of payloads) {
                try {
                    await clientesService.criar(payload);
                    expect.fail('Should have thrown error');
                } catch (err: any) {
                    expect(err.message).to.contain('Nome, email e senha são obrigatórios');
                }
            }
        });

        it('deve lançar erro se o e-mail for inválido', async () => {
            try {
                await clientesService.criar({ ...validPayload, email: 'email-invalido' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('E-mail inválido');
            }
        });

        it('deve lançar erro se o e-mail já estiver cadastrado', async () => {
            sandbox.stub(clientesRepository, 'findByEmail').resolves({ id: 99 } as any);

            try {
                await clientesService.criar(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('E-mail já cadastrado');
            }
        });

        it('deve lançar erro se a senha for fraca', async () => {
            const findByEmailStub = sandbox.stub(clientesRepository, 'findByEmail');
            const createStub = sandbox.stub(clientesRepository, 'create');
            try {
                await clientesService.criar({ ...validPayload, password: 'fraca1' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Senha fraca');
                sinon.assert.notCalled(findByEmailStub);
                sinon.assert.notCalled(createStub);
            }
        });

        it('deve aceitar senha forte com 6 caracteres (regra mínima)', async () => {
            const hashStub = sandbox.stub(bcrypt, 'hash').resolves('hash_minimo' as any);
            sandbox.stub(clientesRepository, 'findByEmail').resolves(null);
            const createStub = sandbox.stub(clientesRepository, 'create').resolves(2);

            const payload = { ...validPayload, password: 'Aa1bbb' };
            const result = await clientesService.criar(payload);

            expect(result).to.deep.equal({ clienteId: 2 });
            sinon.assert.calledWith(hashStub, payload.password, 10);
            sinon.assert.calledOnce(createStub);
        });
    });
});
