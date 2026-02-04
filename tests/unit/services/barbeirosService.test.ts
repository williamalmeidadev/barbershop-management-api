
import { expect } from 'chai';
import sinon from 'sinon';
import { barbeirosService } from '../../../src/services/barbeirosService';
import { barbeirosRepository } from '../../../src/repositories/barbeirosRepository';
import { Barbeiro } from '../../../src/interfaces/barbeiro';

describe('BarbeirosService', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('criar', () => {
        const validPayload = {
            nome_profissional: 'Barbeiro Teste',
            bio: 'Bio teste'
        };

        it('deve criar barbeiro com sucesso (ativo padrão = 1)', async () => {
            const mockBarbeiro: Barbeiro = { ...validPayload, id: 1, ativo: 1 };
            const createStub = sandbox.stub(barbeirosRepository, 'criar').resolves(mockBarbeiro);

            const result = await barbeirosService.criar(validPayload);

            expect(result).to.deep.equal(mockBarbeiro);
            sinon.assert.calledWith(createStub, sinon.match({
                nome_profissional: validPayload.nome_profissional,
                bio: validPayload.bio,
                ativo: 1
            }));
        });

        it('deve falhar se nome_profissional não for informado', async () => {
            try {
                // @ts-ignore
                await barbeirosService.criar({ bio: 'Bio' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Nome profissional é obrigatório');
            }
        });

        it('deve falhar se ativo for diferente de 0 ou 1', async () => {
            try {
                await barbeirosService.criar({ ...validPayload, ativo: 2 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Ativo deve ser 0 ou 1');
            }
        });
    });

    describe('listar', () => {
        it('deve retornar a lista de barbeiros sem filtro', async () => {
            const mockList: Barbeiro[] = [];
            const listStub = sandbox.stub(barbeirosRepository, 'listar').resolves(mockList);

            const result = await barbeirosService.listar();

            expect(result).to.deep.equal(mockList);
            sinon.assert.calledWith(listStub, undefined);
        });

        it('deve retornar a lista de barbeiros com filtro ativo', async () => {
            const listStub = sandbox.stub(barbeirosRepository, 'listar').resolves([]);

            await barbeirosService.listar(1);

            sinon.assert.calledWith(listStub, 1);
        });

        it('deve falhar se filtro ativo for inválido', async () => {
            try {
                await barbeirosService.listar(2);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Parâmetro ativo inválido');
            }
        });
    });

    describe('buscarPorId', () => {
        it('deve retornar o barbeiro se encontrado', async () => {
            const mockBarbeiro: Barbeiro = { id: 1, nome_profissional: 'Teste', ativo: 1 };
            sandbox.stub(barbeirosRepository, 'buscarPorId').resolves(mockBarbeiro);

            const result = await barbeirosService.buscarPorId(1);

            expect(result).to.deep.equal(mockBarbeiro);
        });

        it('deve lançar erro se barbeiro não encontrado', async () => {
            sandbox.stub(barbeirosRepository, 'buscarPorId').resolves(null);

            try {
                await barbeirosService.buscarPorId(1);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Barbeiro não encontrado');
            }
        });

        it('deve lançar erro se ID não informado', async () => {
            try {
                // @ts-ignore
                await barbeirosService.buscarPorId(undefined);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('O id do barbeiro é obrigatório');
            }
        });
    });

    describe('atualizar', () => {
        it('deve atualizar parcialmente com sucesso', async () => {
            const mockBarbeiro: Barbeiro = { id: 1, nome_profissional: 'Novo Nome', ativo: 1 };
            const updateStub = sandbox.stub(barbeirosRepository, 'atualizar').resolves(mockBarbeiro);

            const result = await barbeirosService.atualizar(1, { nome_profissional: 'Novo Nome' });

            expect(result).to.deep.equal(mockBarbeiro);
            sinon.assert.calledWith(updateStub, 1, { nome_profissional: 'Novo Nome' });
        });

        it('deve lançar erro se payload estiver vazio', async () => {
            try {
                await barbeirosService.atualizar(1, {});
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Informe ao menos um campo para atualizar');
            }
        });

        it('deve lançar erro se id não informado', async () => {
            try {
                // @ts-ignore
                await barbeirosService.atualizar(undefined, { nome_profissional: 'Teste' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('O id do barbeiro é obrigatório');
            }
        });

        it('deve lançar erro se ativo for inválido', async () => {
            try {
                await barbeirosService.atualizar(1, { ativo: 3 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Ativo deve ser 0 ou 1');
            }
        });
    });

    describe('desativar', () => {
        it('deve chamar repositório desativar corretamente', async () => {
            const mockBarbeiro: Barbeiro = { id: 1, nome_profissional: 'Teste', ativo: 0 };
            const desativarStub = sandbox.stub(barbeirosRepository, 'desativar').resolves(mockBarbeiro);

            const result = await barbeirosService.desativar(1);

            expect(result).to.deep.equal(mockBarbeiro);
            sinon.assert.calledWith(desativarStub, 1);
        });

        it('deve lançar erro se id não informado', async () => {
            try {
                // @ts-ignore
                await barbeirosService.desativar(undefined);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('O id do barbeiro é obrigatório');
            }
        });
    });
});
