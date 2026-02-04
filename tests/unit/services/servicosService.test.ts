
import { expect } from 'chai';
import sinon from 'sinon';
import { servicoService } from '../../../src/services/servicosService';
import { servicoRepository } from '../../../src/repositories/servicosRepository';
import { Servico } from '../../../src/interfaces/servico';

describe('ServicosService', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('buscarPorIds', () => {
        it('deve retornar os serviços encontrados pelos IDs', async () => {
            const mockServices: Servico[] = [
                { id: 1, barbeiro_id: 1, nome: 'Corte', descricao: '', duracao_minutos: 30, preco_centavos: 5000, ativo: 1 }
            ];
            const findByIdsStub = sandbox.stub(servicoRepository, 'findByIds').resolves(mockServices);

            const result = await servicoService.buscarPorIds([1]);

            expect(result).to.deep.equal(mockServices);
            sinon.assert.calledWith(findByIdsStub, [1]);
        });
    });

    describe('listar', () => {
        it('deve retornar todos os serviços quando nenhum filtro for fornecido.', async () => {
            const mockServices: Servico[] = [];
            const listStub = sandbox.stub(servicoRepository, 'list').resolves(mockServices);

            const result = await servicoService.listar();

            expect(result).to.deep.equal(mockServices);
            sinon.assert.calledWith(listStub, undefined);
        });

        it('deve retornar serviços filtrados quando o filtro for fornecido', async () => {
            const listStub = sandbox.stub(servicoRepository, 'list').resolves([]);

            await servicoService.listar(1);

            sinon.assert.calledWith(listStub, 1);
        });

        it('deve lançar um erro se o parâmetro ativo for inválido.', async () => {
            try {
                await servicoService.listar(2);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Parâmetro ativo inválido');
            }
        });
    });

    describe('buscarPorId', () => {
        it('deve retornar o serviço se encontrado', async () => {
            const mockService: Servico = { id: 1, barbeiro_id: 1, nome: 'Corte', descricao: '', duracao_minutos: 30, preco_centavos: 5000, ativo: 1 };
            sandbox.stub(servicoRepository, 'findById').resolves(mockService);

            const result = await servicoService.buscarPorId(1);

            expect(result).to.deep.equal(mockService);
        });

        it('deve lançar um erro se o serviço não for encontrado', async () => {
            sandbox.stub(servicoRepository, 'findById').resolves(null);

            try {
                await servicoService.buscarPorId(1);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Serviço não encontrado');
            }
        });

        it('deve lançar um erro se o ID não for fornecido.', async () => {
            // TypeScript verification usually prevents this, but runtime check exists
            try {
                // @ts-ignore
                await servicoService.buscarPorId(undefined);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('O id do serviço é obrigatório');
            }
        });
    });

    describe('criar', () => {
        const validPayload = {
            barbeiro_id: 1,
            nome: 'Corte',
            duracao_minutos: 30,
            preco_centavos: 5000
        };

        it('deve criar o serviço com sucesso', async () => {
            const mockService: Servico = { ...validPayload, id: 1, descricao: '', ativo: 1 };
            const createStub = sandbox.stub(servicoRepository, 'create').resolves(mockService);

            const result = await servicoService.criar(validPayload);

            expect(result).to.deep.equal(mockService);
            sinon.assert.calledWith(createStub, sinon.match({ ...validPayload, ativo: 1 }));
        });

        it('deve gerar um erro se faltarem campos obrigatórios.', async () => {
            // @ts-ignore
            const invalidPayload = { barbeiro_id: 1, nome: 'Corte' };
            try {
                // @ts-ignore
                await servicoService.criar(invalidPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Nome, duração e preço são obrigatórios');
            }
        });

        it('deve lançar um erro se a duração não for positiva', async () => {
            try {
                await servicoService.criar({ ...validPayload, duracao_minutos: 0 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('A duração deve ser positiva');
            }
        });

        it('deve gerar um erro se o preço for negativo.', async () => {
            try {
                await servicoService.criar({ ...validPayload, preco_centavos: -100 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Preço não pode ser negativo');
            }
        });

        it('deve lançar um erro se ativo for inválido', async () => {
            try {
                await servicoService.criar({ ...validPayload, ativo: 2 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Ativo deve ser 0 ou 1');
            }
        });
    });

    describe('atualizar', () => {
        it('deve atualizar o serviço com sucesso', async () => {
            const mockService: Servico = { id: 1, barbeiro_id: 1, nome: 'Corte Novo', descricao: '', duracao_minutos: 30, preco_centavos: 5000, ativo: 1 };
            const updateStub = sandbox.stub(servicoRepository, 'update').resolves(mockService);

            const result = await servicoService.atualizar(1, { nome: 'Corte Novo' });

            expect(result).to.deep.equal(mockService);
            sinon.assert.calledWith(updateStub, 1, { nome: 'Corte Novo' });
        });

        it('deve lançar um erro se o ID estiver ausente.', async () => {
            try {
                // @ts-ignore
                await servicoService.atualizar(undefined, { nome: 'A' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('O id do serviço é obrigatório');
            }
        });

        it('deve lançar um erro se a carga útil estiver vazia.', async () => {
            try {
                await servicoService.atualizar(1, {});
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Informe ao menos um campo para atualizar');
            }
        });

        it('deve lançar um erro se a duração for inválida.', async () => {
            try {
                await servicoService.atualizar(1, { duracao_minutos: 0 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('A duração deve ser positiva');
            }
        });

        it('deve lançar um erro se o preço for inválido.', async () => {
            try {
                await servicoService.atualizar(1, { preco_centavos: -1 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Preço não pode ser negativo');
            }
        });

        it('deve lançar um erro se ativo for inválido', async () => {
            try {
                await servicoService.atualizar(1, { ativo: 5 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Ativo deve ser 0 ou 1');
            }
        });
    });

    describe('desativar', () => {
        it('deve desativar o serviço com sucesso', async () => {
            const mockService: Servico = { id: 1, barbeiro_id: 1, nome: 'Corte', descricao: '', duracao_minutos: 30, preco_centavos: 5000, ativo: 0 };
            const deactivateStub = sandbox.stub(servicoRepository, 'deactivate').resolves(mockService);

            const result = await servicoService.desativar(1);

            expect(result).to.deep.equal(mockService);
            sinon.assert.calledWith(deactivateStub, 1);
        });

        it('deve lançar um erro se o ID estiver ausente.', async () => {
            try {
                // @ts-ignore
                await servicoService.desativar(undefined);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('O id do serviço é obrigatório');
            }
        });
    });
});
