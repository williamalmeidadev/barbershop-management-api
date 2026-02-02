
import { expect } from 'chai';
import sinon from 'sinon';
import { bookingService } from '../../../src/services/agendamentosService';
import { agendamentosRepository } from '../../../src/repositories/agendamentosRepository';
import { clientesRepository } from '../../../src/repositories/clientesRepository';
import { StatusAgendamento } from '../../../src/interfaces/agendamento';
import { servicoService } from '../../../src/services/servicosService';
import { vagasService } from '../../../src/services/vagasService';
import * as transactionModule from '../../../src/repositories/transaction';

describe('AgendamentosService - Discount Refund', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Mock transaction to just execute callback
        sandbox.stub(transactionModule, 'runInTransaction').callsFake(async (callback) => callback());
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('cancelarAgendamento', () => {
        it('deve reembolsar o desconto ao cliente se o agendamento tiver desconto aplicado', async () => {
            const mockAgendamento = {
                id: 1,
                cliente_id: 10,
                status: StatusAgendamento.AGENDADO,
                desconto_aplicado_centavos: 1000,
                valor_original_centavos: 5000,
                valor_total_centavos: 4000
            };

            const requester = { id: 10, role: 'client' };

            // Stubs
            sandbox.stub(agendamentosRepository, 'buscarAgendamentoPorId').resolves(mockAgendamento as any);
            const cancelarStub = sandbox.stub(agendamentosRepository, 'cancelarAgendamento').resolves();
            sandbox.stub(agendamentosRepository, 'buscarAgendamentoCompleto').resolves({ ...mockAgendamento, status: StatusAgendamento.CANCELADO } as any);

            // Mock Cliente
            const mockCliente = { id: 10, desconto_disponivel_centavos: 0 };
            sandbox.stub(clientesRepository, 'buscarResumo').resolves(mockCliente as any);

            // Stub para verificar reembolso
            const refundStub = sandbox.stub(clientesRepository, 'atualizarContagemEDesconto').resolves();

            await bookingService.cancelarAgendamento(1, requester);

            sinon.assert.calledOnce(refundStub);
            sinon.assert.calledWith(refundStub, 10, sinon.match.any, 1000);
        });

        it('NÃO deve reembolsar se não houve desconto aplicado', async () => {
            const mockAgendamento = {
                id: 1,
                cliente_id: 10,
                status: StatusAgendamento.AGENDADO,
                desconto_aplicado_centavos: 0,
                valor_original_centavos: 5000,
                valor_total_centavos: 5000
            };

            const requester = { id: 10, role: 'client' };

            sandbox.stub(agendamentosRepository, 'buscarAgendamentoPorId').resolves(mockAgendamento as any);
            sandbox.stub(agendamentosRepository, 'cancelarAgendamento').resolves();
            sandbox.stub(agendamentosRepository, 'buscarAgendamentoCompleto').resolves({ ...mockAgendamento, status: StatusAgendamento.CANCELADO } as any);

            const refundStub = sandbox.stub(clientesRepository, 'atualizarContagemEDesconto').resolves();

            await bookingService.cancelarAgendamento(1, requester);

            sinon.assert.notCalled(refundStub);
        });
    });

    describe('recusarAgendamento', () => {
        it('deve reembolsar o desconto ao cliente se o agendamento tiver desconto aplicado', async () => {
            const mockAgendamento = {
                id: 1,
                cliente_id: 10,
                status: StatusAgendamento.SOLICITADO,
                desconto_aplicado_centavos: 1500
            };

            sandbox.stub(agendamentosRepository, 'buscarAgendamentoPorId').resolves(mockAgendamento as any);
            sandbox.stub(agendamentosRepository, 'atualizarStatus').resolves();
            sandbox.stub(agendamentosRepository, 'buscarAgendamentoCompleto').resolves({ ...mockAgendamento, status: StatusAgendamento.RECUSADO } as any);

            // Mock Cliente
            sandbox.stub(clientesRepository, 'buscarResumo').resolves({ id: 10, desconto_disponivel_centavos: 0 } as any);
            const refundStub = sandbox.stub(clientesRepository, 'atualizarContagemEDesconto').resolves();

            await bookingService.recusarAgendamento(1);

            sinon.assert.calledOnce(refundStub);
            sinon.assert.calledWith(refundStub, 10, sinon.match.any, 1500);
        });
    });
});
