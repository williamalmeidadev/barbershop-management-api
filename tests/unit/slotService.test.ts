import { expect } from 'chai'
import sinon from 'sinon'
import { slotService } from '../../src/services/slotService'
import { slotRepository } from '../../src/repositories/slotRepository'
import { Slot, SlotStatus } from '../../src/interfaces/slot'

describe('SlotService (Unitário)', () => {
    // Variável para controlar os stubs (mocks) e limpar depois de cada teste
    let sandbox: sinon.SinonSandbox

    beforeEach(() => {
        sandbox = sinon.createSandbox()
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('buscarBlocoLivre', () => {
        it('deve encontrar slots contíguos suficientes para um serviço longo', async () => {
            // Simula 2 slots de 30min: 10:00-10:30 e 10:30-11:00
            const slotsMock: Slot[] = [
                { id: 1, barbeiro_id: 1, inicio: '2026-01-28T10:00:00', fim: '2026-01-28T10:30:00', status: SlotStatus.DISPONIVEL },
                { id: 2, barbeiro_id: 1, inicio: '2026-01-28T10:30:00', fim: '2026-01-28T11:00:00', status: SlotStatus.DISPONIVEL }
            ]

            const repoStub = sandbox.stub(slotRepository, 'findDisponiveisByBarbeiroEData').resolves(slotsMock)

            const resultado = await slotService.buscarBlocoLivre(1, '2026-01-28T10:00:00', 60)

            expect(repoStub.calledOnce).to.be.true // Garante que o service chamou o repo
            expect(resultado).to.not.be.null
            expect(resultado).to.have.lengthOf(2) 
            expect(resultado![0].id).to.equal(1)
            expect(resultado![1].id).to.equal(2)
        })

        it('deve retornar null se houver um "buraco" entre os horários (descontinuidade)', async () => {
            // Simula buraco entre 10:30 e 11:00 
            // Slots: 10:00-10:30 ... buraco ... 11:00-11:30
            const slotsMock: Slot[] = [
                { id: 1, barbeiro_id: 1, inicio: '2026-01-28T10:00:00', fim: '2026-01-28T10:30:00', status: SlotStatus.DISPONIVEL },
                { id: 2, barbeiro_id: 1, inicio: '2026-01-28T11:00:00', fim: '2026-01-28T11:30:00', status: SlotStatus.DISPONIVEL }
            ]

            sandbox.stub(slotRepository, 'findDisponiveisByBarbeiroEData').resolves(slotsMock)

            // Tanta agendar 60 min
            const resultado = await slotService.buscarBlocoLivre(1, '2026-01-28T10:00:00', 60)

            expect(resultado).to.be.null 
        })

        it('deve retornar null se não houver slots suficientes (duração curta)', async () => {
            // Simula apenas 1 slot de 30 min disponível
            const slotsMock: Slot[] = [
                { id: 1, barbeiro_id: 1, inicio: '2026-01-28T10:00:00', fim: '2026-01-28T10:30:00', status: SlotStatus.DISPONIVEL }
            ]

            sandbox.stub(slotRepository, 'findDisponiveisByBarbeiroEData').resolves(slotsMock)

            // Tenta agendar 45 min
            const resultado = await slotService.buscarBlocoLivre(1, '2026-01-28T10:00:00', 45)

            expect(resultado).to.be.null
        })
    })

    describe('reservarSlotsParaAgendamento', () => {
        it('deve reservar slots e atualizar status no banco (updateStatusLote) quando encontrar horário livre', async () => {
            const slotsMock: Slot[] = [
                { id: 10, barbeiro_id: 1, inicio: '2026-01-29T14:00:00', fim: '2026-01-29T14:30:00', status: SlotStatus.DISPONIVEL },
                { id: 11, barbeiro_id: 1, inicio: '2026-01-29T14:30:00', fim: '2026-01-29T15:00:00', status: SlotStatus.DISPONIVEL }
            ]

            // Simula que o banco achou os slots livres
            sandbox.stub(slotRepository, 'findDisponiveisByBarbeiroEData').resolves(slotsMock)
            
            // Monitora se update será chamado
            const updateStub = sandbox.stub(slotRepository, 'updateStatusLote').resolves()

            const resultado = await slotService.reservarSlotsParaAgendamento(1, '2026-01-29T14:00:00', 60)

            expect(resultado).to.not.be.null
            expect(resultado).to.have.lengthOf(2)
            
            // Verifica se o sistema tentou escrever no banco
            expect(updateStub.calledOnce).to.be.true
            
            // Garante que mandou os IDs certos (10 e 11) e o status RESERVADO
            expect(updateStub.calledWith([10, 11], SlotStatus.RESERVADO)).to.be.true
        })

        it('NÃO deve chamar updateStatusLote se não houver slots suficientes', async () => {
            // Simula apenas 1 slot de 30 min (insuficiente para 60 min)
            const slotsMock: Slot[] = [
                { id: 10, barbeiro_id: 1, inicio: '2026-01-29T14:00:00', fim: '2026-01-29T14:30:00', status: SlotStatus.DISPONIVEL }
            ]

            sandbox.stub(slotRepository, 'findDisponiveisByBarbeiroEData').resolves(slotsMock)
            
            // Monitoramos o update novamente
            const updateStub = sandbox.stub(slotRepository, 'updateStatusLote').resolves()

            const resultado = await slotService.reservarSlotsParaAgendamento(1, '2026-01-29T14:00:00', 60)

            expect(resultado).to.be.null
            
            // Garante que o banco não foi tocado em caso de falha de validação
            expect(updateStub.called).to.be.false 
        })
    })
})