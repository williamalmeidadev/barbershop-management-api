import { expect } from 'chai'
import sinon from 'sinon'
import { vagasService } from '../../src/services/vagasService'
import { vagasRepository } from '../../src/repositories/vagasRepository'
import { Vaga, StatusVaga } from '../../src/interfaces/vaga'

describe('VagasService (Unitário)', () => {
    let sandbox: sinon.SinonSandbox

    beforeEach(() => {
        sandbox = sinon.createSandbox()
        const agoraFalso = new Date('2026-01-28T08:00:00Z').getTime()
        sandbox.useFakeTimers(agoraFalso)
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('buscarBlocoLivre', () => {
        it('deve encontrar vagas contíguas suficientes para um serviço longo', async () => {
            const vagasMock: Vaga[] = [
                { id: 1, barbeiro_id: 1, inicio: '2026-01-28T10:00:00Z', fim: '2026-01-28T10:30:00Z', status: StatusVaga.DISPONIVEL },
                { id: 2, barbeiro_id: 1, inicio: '2026-01-28T10:30:00Z', fim: '2026-01-28T11:00:00Z', status: StatusVaga.DISPONIVEL }
            ]

            const repoStub = sandbox.stub(vagasRepository, 'buscarDisponiveisPorBarbeiroEData').resolves(vagasMock)

            const resultado = await vagasService.buscarBlocoLivre(1, '2026-01-28T10:00:00Z', 60)

            expect(repoStub.calledOnce).to.be.true
            expect(resultado).to.not.be.null
            expect(resultado).to.have.lengthOf(2)
            expect(resultado![0].id).to.equal(1)
            expect(resultado![1].id).to.equal(2)
        })

        it('deve retornar null se houver um "buraco" entre os horários', async () => {
            // Buraco entre 10:30 e 11:00
            const vagasMock: Vaga[] = [
                { id: 1, barbeiro_id: 1, inicio: '2026-01-28T10:00:00Z', fim: '2026-01-28T10:30:00Z', status: StatusVaga.DISPONIVEL },
                { id: 2, barbeiro_id: 1, inicio: '2026-01-28T11:00:00Z', fim: '2026-01-28T11:30:00Z', status: StatusVaga.DISPONIVEL }
            ]

            sandbox.stub(vagasRepository, 'buscarDisponiveisPorBarbeiroEData').resolves(vagasMock)

            const resultado = await vagasService.buscarBlocoLivre(1, '2026-01-28T10:00:00Z', 60)

            expect(resultado).to.be.null
        })
    })

    describe('reservarVagasParaAgendamento', () => {
        it('deve reservar vagas e atualizar status no banco quando encontrar horário livre', async () => {
            const vagasMock: Vaga[] = [
                { id: 10, barbeiro_id: 1, inicio: '2026-01-29T14:00:00Z', fim: '2026-01-29T14:30:00Z', status: StatusVaga.DISPONIVEL },
                { id: 11, barbeiro_id: 1, inicio: '2026-01-29T14:30:00Z', fim: '2026-01-29T15:00:00Z', status: StatusVaga.DISPONIVEL }
            ]

            sandbox.stub(vagasRepository, 'buscarDisponiveisPorBarbeiroEData').resolves(vagasMock)
            
            const verifyStub = sandbox.stub(vagasRepository, 'verificarDisponiveisPorIds').resolves(true)

            const updateStub = sandbox.stub(vagasRepository, 'atualizarStatusLote').resolves()

            const resultado = await vagasService.reservarVagasParaAgendamento(1, '2026-01-29T14:00:00Z', 60, { manageTransaction: false })

            expect(resultado).to.not.be.null
            expect(resultado).to.have.lengthOf(2)
            expect(verifyStub.calledOnce).to.be.true
            expect(updateStub.calledOnce).to.be.true
            expect(updateStub.calledWith([10, 11], StatusVaga.RESERVADO)).to.be.true
        })

        it('NÃO deve reservar se a verificação de segurança (Double Check) falhar', async () => {
            const vagasMock: Vaga[] = [
                { id: 10, barbeiro_id: 1, inicio: '2026-01-29T14:00:00Z', fim: '2026-01-29T14:30:00Z', status: StatusVaga.DISPONIVEL },
                { id: 11, barbeiro_id: 1, inicio: '2026-01-29T14:30:00Z', fim: '2026-01-29T15:00:00Z', status: StatusVaga.DISPONIVEL }
            ]

            sandbox.stub(vagasRepository, 'buscarDisponiveisPorBarbeiroEData').resolves(vagasMock)
            
            sandbox.stub(vagasRepository, 'verificarDisponiveisPorIds').resolves(false)

            const updateStub = sandbox.stub(vagasRepository, 'atualizarStatusLote').resolves()

            const resultado = await vagasService.reservarVagasParaAgendamento(1, '2026-01-29T14:00:00Z', 60, { manageTransaction: false })

            expect(resultado).to.be.null
            expect(updateStub.called).to.be.false 
        })
    })
})