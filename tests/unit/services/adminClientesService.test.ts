
import { expect } from 'chai';
import sinon from 'sinon';
import { adminClientesService } from '../../../src/services/adminClientesService';
import { clientesRepository } from '../../../src/repositories/clientesRepository';
import { Cliente } from '../../../src/interfaces/cliente';

describe('AdminClientesService', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('listar', () => {
        it('deve listar clientes sem filtro', async () => {
            const mockClientes: Cliente[] = [];
            const listStub = sandbox.stub(clientesRepository, 'list').resolves(mockClientes);

            const result = await adminClientesService.listar();

            expect(result).to.deep.equal(mockClientes);
            sinon.assert.calledWith(listStub, undefined);
        });

        it('deve listar clientes com filtro ativo', async () => {
            const listStub = sandbox.stub(clientesRepository, 'list').resolves([]);

            await adminClientesService.listar(1);

            sinon.assert.calledWith(listStub, 1);
        });

        it('deve lançar erro se filtro ativo for inválido', async () => {
            try {
                await adminClientesService.listar(2);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Parâmetro ativo inválido');
            }
        });
    });

    describe('listarSimples', () => {
        it('deve chamar listSimpleAtivos', async () => {
            const listSimpleStub = sandbox.stub(clientesRepository, 'listSimpleAtivos').resolves([]);
            await adminClientesService.listarSimples();
            sinon.assert.calledOnce(listSimpleStub);
        });
    });

    describe('buscarPorId', () => {
        it('deve retornar cliente se encontrado', async () => {
            const mockCliente = { id: 1 } as Cliente;
            sandbox.stub(clientesRepository, 'findById').resolves(mockCliente);
            const result = await adminClientesService.buscarPorId(1);
            expect(result).to.deep.equal(mockCliente);
        });

        it('deve lançar erro se cliente não encontrado', async () => {
            sandbox.stub(clientesRepository, 'findById').resolves(null);
            try {
                await adminClientesService.buscarPorId(1);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Cliente não encontrado');
            }
        });

        it('deve lançar erro se id não informado', async () => {
            try {
                // @ts-ignore
                await adminClientesService.buscarPorId(undefined);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('O id do cliente é obrigatório');
            }
        });
    });

    describe('atualizar', () => {
        const mockCliente = { id: 1, email: 'old@test.com' } as Cliente;

        it('deve atualizar campos simples com sucesso', async () => {
            const updateStub = sandbox.stub(clientesRepository, 'update').resolves(mockCliente);
            await adminClientesService.atualizar(1, { nome: 'Novo Nome' });
            sinon.assert.calledWith(updateStub, 1, { nome: 'Novo Nome' });
        });

        it('deve permitir atualizar email se não existir outro com mesmo email', async () => {
            sandbox.stub(clientesRepository, 'findByEmailExcludingId').resolves(null);
            const updateStub = sandbox.stub(clientesRepository, 'update').resolves(mockCliente);

            await adminClientesService.atualizar(1, { email: 'new@test.com' });

            sinon.assert.calledWith(updateStub, 1, { email: 'new@test.com' });
        });

        it('deve lançar erro se email já cadastrado por outro usuário', async () => {
            sandbox.stub(clientesRepository, 'findByEmailExcludingId').resolves({ id: 99 });

            try {
                await adminClientesService.atualizar(1, { email: 'taken@test.com' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('E-mail já cadastrado');
            }
        });

        it('deve lançar erro se email inválido', async () => {
            try {
                await adminClientesService.atualizar(1, { email: 'invalid' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('E-mail inválido');
            }
        });

        it('deve lançar erro se payload vazio', async () => {
            try {
                await adminClientesService.atualizar(1, {});
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Informe ao menos um campo');
            }
        });

        it('deve lançar erro se ativo inválido', async () => {
            try {
                await adminClientesService.atualizar(1, { ativo: 3 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Ativo deve ser 0 ou 1');
            }
        });
    });

    describe('desativar', () => {
        it('deve chamar repositório deactivate', async () => {
            const deactivateStub = sandbox.stub(clientesRepository, 'deactivate').resolves({} as Cliente);
            await adminClientesService.desativar(1);
            sinon.assert.calledWith(deactivateStub, 1);
        });

        it('deve lançar erro se id não informado', async () => {
            try {
                // @ts-ignore
                await adminClientesService.desativar(undefined);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('O id do cliente é obrigatório');
            }
        });
    });
});
