
import { expect } from 'chai';
import sinon from 'sinon';
import { configuracoesService } from '../../../src/services/configuracoesService';
import { configuracoesRepository } from '../../../src/repositories/configuracoesRepository';

describe('ConfiguracoesService', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('obterRegrasDesconto', () => {
        it('deve retornar as regras de desconto configuradas', async () => {
            const getIntStub = sandbox.stub(configuracoesRepository, 'getInt');
            getIntStub.withArgs('desconto_qtd_concluidos').resolves(10);
            getIntStub.withArgs('desconto_valor_centavos').resolves(5000);

            const result = await configuracoesService.obterRegrasDesconto();

            expect(result).to.deep.equal({
                desconto_qtd_concluidos: 10,
                desconto_valor_centavos: 5000
            });
            sinon.assert.calledTwice(getIntStub);
        });

        it('deve retornar null se as regras não estiverem configuradas', async () => {
            sandbox.stub(configuracoesRepository, 'getInt').resolves(null);

            const result = await configuracoesService.obterRegrasDesconto();

            expect(result).to.deep.equal({
                desconto_qtd_concluidos: null,
                desconto_valor_centavos: null
            });
        });
    });

    describe('atualizarRegrasDesconto', () => {
        it('deve atualizar ambas as regras com sucesso', async () => {
            const setIntStub = sandbox.stub(configuracoesRepository, 'setInt').resolves();

            await configuracoesService.atualizarRegrasDesconto({
                desconto_qtd_concluidos: 10,
                desconto_valor_centavos: 2000
            });

            sinon.assert.calledTwice(setIntStub);
            sinon.assert.calledWith(setIntStub, 'desconto_qtd_concluidos', 10);
            sinon.assert.calledWith(setIntStub, 'desconto_valor_centavos', 2000);
        });

        it('deve atualizar parcialmente (apenas quantidade)', async () => {
            const setIntStub = sandbox.stub(configuracoesRepository, 'setInt').resolves();

            await configuracoesService.atualizarRegrasDesconto({
                desconto_qtd_concluidos: 5
            });

            sinon.assert.calledOnce(setIntStub);
            sinon.assert.calledWith(setIntStub, 'desconto_qtd_concluidos', 5);
        });

        it('deve atualizar parcialmente (apenas valor)', async () => {
            const setIntStub = sandbox.stub(configuracoesRepository, 'setInt').resolves();

            await configuracoesService.atualizarRegrasDesconto({
                desconto_valor_centavos: 1000
            });

            sinon.assert.calledOnce(setIntStub);
            sinon.assert.calledWith(setIntStub, 'desconto_valor_centavos', 1000);
        });

        it('deve lançar erro se payload estiver vazio', async () => {
            try {
                await configuracoesService.atualizarRegrasDesconto({});
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('Informe ao menos um campo para atualizar');
            }
        });

        it('deve lançar erro se quantidade for <= 0', async () => {
            try {
                await configuracoesService.atualizarRegrasDesconto({ desconto_qtd_concluidos: 0 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('desconto_qtd_concluidos deve ser maior que 0');
            }
        });

        it('deve lançar erro se valor for <= 0', async () => {
            try {
                await configuracoesService.atualizarRegrasDesconto({ desconto_valor_centavos: -100 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.contain('desconto_valor_centavos deve ser maior que 0');
            }
        });
    });
});
