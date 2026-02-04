
import { expect } from 'chai';
import sinon from 'sinon';
import { bookingService } from '../../../src/services/agendamentosService';
import { agendamentosRepository } from '../../../src/repositories/agendamentosRepository';
import { clientesRepository } from '../../../src/repositories/clientesRepository';
import { servicoService } from '../../../src/services/servicosService';
import { vagasService } from '../../../src/services/vagasService';
import { barbeirosService } from '../../../src/services/barbeirosService';
import { configuracoesRepository } from '../../../src/repositories/configuracoesRepository';
import * as transactionModule from '../../../src/repositories/transaction';
import { StatusAgendamento, CriarAgendamentoPayload, PagamentoTipo } from '../../../src/interfaces/agendamento';

describe('AgendamentosService', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(transactionModule, 'runInTransaction').callsFake(async (cb) => cb());
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('criarAgendamento', () => {
        const validPayload: CriarAgendamentoPayload = {
            cliente_id: 1,
            barbeiro_id: 2,
            servicos: [1, 2],
            inicio_desejado: '2030-01-29T10:00:00Z'
        };

        const mockServicos = [
            { id: 1, nome: 'Corte', preco_centavos: 5000, duracao_minutos: 30, ativo: 1 },
            { id: 2, nome: 'Barba', preco_centavos: 3000, duracao_minutos: 20, ativo: 1 }
        ];

        const mockVagas = [
            { id: 101, inicio: '2030-01-29T10:00:00Z', fim: '2030-01-29T10:30:00Z', status: 'LIVRE' },
            { id: 102, inicio: '2030-01-29T10:30:00Z', fim: '2030-01-29T10:50:00Z', status: 'LIVRE' }
        ];

        beforeEach(() => {
            sandbox.stub(barbeirosService, 'buscarPorId').resolves({
                id: validPayload.barbeiro_id,
                ativo: 1
            } as any);
        });

        it('deve criar um agendamento com sucesso com desconto', async () => {
            // Mocks
            sandbox.stub(servicoService, 'buscarPorIds').resolves(mockServicos as any);
            sandbox.stub(clientesRepository, 'buscarResumo').resolves({
                id: 1,
                nome: 'Cliente Teste',
                email: 'teste@example.com',
                telefone: '123456789',
                concluidos_count: 5,
                desconto_disponivel_centavos: 1000 // Tem 10 reais de desconto
            } as any);

            const selecionarVagasStub = sandbox.stub(vagasService, 'selecionarVagasParaAgendamento').resolves(mockVagas as any);

            const criarStub = sandbox.stub(agendamentosRepository, 'criarAgendamento').resolves(123);
            sandbox.stub(agendamentosRepository, 'adicionarServicosAoAgendamento').resolves();
            sandbox.stub(agendamentosRepository, 'adicionarVagasAoAgendamento').resolves();
            const atualizarClienteStub = sandbox.stub(clientesRepository, 'atualizarContagemEDesconto').resolves();

            const mockAgendamentoCompleto = {
                id: 123,
                cliente_id: 1,
                barbeiro_id: 2,
                status: StatusAgendamento.AGENDADO,
                valor_original_centavos: 8000,
                desconto_aplicado_centavos: 1000,
                valor_total_centavos: 7000
            };
            sandbox.stub(agendamentosRepository, 'buscarAgendamentoCompleto').resolves(mockAgendamentoCompleto as any);

            // Execution
            const result = await bookingService.criarAgendamento(validPayload);

            // Assertions
            expect(result).to.deep.equal(mockAgendamentoCompleto);

            sinon.assert.calledWith(criarStub, sinon.match({
                valor_original_centavos: 8000,
                desconto_aplicado_centavos: 1000,
                valor_total_centavos: 7000,
                inicio: mockVagas[0].inicio,
                fim: mockVagas[mockVagas.length - 1].fim
            }));

            sinon.assert.calledWith(selecionarVagasStub,
                validPayload.barbeiro_id,
                validPayload.inicio_desejado,
                50 // 30 + 20 duration
            );

            sinon.assert.calledWith(atualizarClienteStub, 1, 5, 0);
        });

        it('deve gerar um erro se os campos obrigatórios estiverem faltando.', async () => {
            const invalidPayload = { ...validPayload, cliente_id: undefined } as any;
            try {
                await bookingService.criarAgendamento(invalidPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Todos os campos são obrigatórios');
            }
        });

        it('deve gerar erro se inicio_desejado for inválido', async () => {
            const invalidPayload = { ...validPayload, inicio_desejado: 'invalid-date' };
            try {
                await bookingService.criarAgendamento(invalidPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('inicio_desejado deve ser ISO 8601');
            }
        });

        it('deve lançar um erro se os serviços não forem encontrados.', async () => {
            sandbox.stub(servicoService, 'buscarPorIds').resolves([mockServicos[0]] as any); // Only returned 1 service, asked for 2
            try {
                await bookingService.criarAgendamento(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Um ou mais serviços não encontrados');
            }
        });

        it('deve gerar um erro se não houver vagas disponíveis.', async () => {
            sandbox.stub(servicoService, 'buscarPorIds').resolves(mockServicos as any);
            sandbox.stub(clientesRepository, 'buscarResumo').resolves({} as any);
            sandbox.stub(vagasService, 'selecionarVagasParaAgendamento').resolves([]); // Empty vagas

            try {
                await bookingService.criarAgendamento(validPayload);
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Não há slots disponíveis');
            }
        });
    });

    describe('cancelarAgendamento', () => {
        it('deve cancelar com sucesso', async () => {
            const mockAgendamento = {
                id: 1,
                cliente_id: 1,
                status: StatusAgendamento.AGENDADO
            };

            sandbox.stub(agendamentosRepository, 'buscarAgendamentoPorId').resolves(mockAgendamento as any);
            const cancelarStub = sandbox.stub(agendamentosRepository, 'cancelarAgendamento').resolves();
            sandbox.stub(agendamentosRepository, 'buscarAgendamentoCompleto').resolves({ ...mockAgendamento, status: StatusAgendamento.CANCELADO } as any);

            const result = await bookingService.cancelarAgendamento(1, { id: 1, role: 'client' });

            sinon.assert.calledWith(cancelarStub, 1);
            expect(result.status).to.equal(StatusAgendamento.CANCELADO);
        });

        it('deve gerar um erro se a agenda já estiver cancelada.', async () => {
            sandbox.stub(agendamentosRepository, 'buscarAgendamentoPorId').resolves({
                id: 1,
                cliente_id: 1,
                status: StatusAgendamento.CANCELADO
            } as any);

            try {
                await bookingService.cancelarAgendamento(1, { id: 1, role: 'client' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Agendamento já cancelado');
            }
        });

        it('deve gerar um erro se a agendação já estiver concluída.', async () => {
            sandbox.stub(agendamentosRepository, 'buscarAgendamentoPorId').resolves({
                id: 1,
                cliente_id: 1,
                status: StatusAgendamento.CONCLUIDO
            } as any);

            try {
                await bookingService.cancelarAgendamento(1, { id: 1, role: 'client' });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Agendamento já concluído');
            }
        });
    });

    describe('concluirAgendamento', () => {
        it('deve ser concluído com sucesso e as regras devem ser aplicadas.', async () => {
            const now = new Date();
            const pastStart = new Date(now.getTime() - 3600000).toISOString();
            const futureEnd = new Date(now.getTime() + 3600000).toISOString();

            const mockAgendamento = {
                id: 1,
                cliente_id: 10,
                status: StatusAgendamento.AGENDADO,
                inicio: pastStart,
                fim: futureEnd
            };

            const mockCliente = {
                id: 10,
                concluidos_count: 9,
                desconto_disponivel_centavos: 0
            };

            sandbox.stub(agendamentosRepository, 'buscarAgendamentoPorId').resolves(mockAgendamento as any);
            sandbox.stub(agendamentosRepository, 'buscarVagasDoAgendamento').resolves([
                { id: 50, inicio: futureEnd, fim: futureEnd }
            ] as any);
            const liberarVagasStub = sandbox.stub(vagasService, 'liberarVagasDoAgendamento').resolves();

            const concluirStub = sandbox.stub(agendamentosRepository, 'concluirAgendamento').resolves();
            sandbox.stub(clientesRepository, 'buscarResumo').resolves(mockCliente as any);

            sandbox.stub(configuracoesRepository, 'getInt')
                .withArgs('desconto_qtd_concluidos').resolves(10)
                .withArgs('desconto_valor_centavos').resolves(2000);

            const atualizarClienteStub = sandbox.stub(clientesRepository, 'atualizarContagemEDesconto').resolves();
            sandbox.stub(agendamentosRepository, 'buscarAgendamentoCompleto').resolves({ ...mockAgendamento, status: StatusAgendamento.CONCLUIDO } as any);

            await bookingService.concluirAgendamento(1, PagamentoTipo.DINHEIRO);

            sinon.assert.calledWith(concluirStub, 1, sinon.match.string);

            sinon.assert.calledWith(atualizarClienteStub, 10, 10, 2000);
            sinon.assert.calledWith(liberarVagasStub, [50]);
        });
    });
});
