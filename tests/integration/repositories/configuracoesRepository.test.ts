
import { expect } from 'chai';
import { configuracoesRepository } from '../../../src/repositories/configuracoesRepository';
import { db } from '../../../src/database/sqlite';
import { initDatabase } from '../../../src/database/init';

describe('ConfiguracoesRepository Integration', function () {
    this.timeout(5000);

    before((done) => {
        initDatabase();
        db.get('SELECT 1', (err) => {
            if (err) done(err);
            else done();
        });
    });

    beforeEach(async () => {
        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM configuracoes', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });

    describe('Upsert (Insert or Update)', () => {
        it('deve inserir novo valor e atualizar existente', async () => {
            const chave = 'desconto_teste';

            // Inserir
            await configuracoesRepository.setInt(chave, 1000);

            const valor1 = await configuracoesRepository.getInt(chave);
            expect(valor1).to.equal(1000);

            // Atualizar
            await configuracoesRepository.setInt(chave, 2000);

            const valor2 = await configuracoesRepository.getInt(chave);
            expect(valor2).to.equal(2000);

            // Garantir que não duplicou (SQL deve garantir mas testamos comportamento)
            const count = await new Promise<number>((resolve, reject) => {
                db.get(`SELECT COUNT(*) as c FROM configuracoes WHERE chave = ?`, [chave], (err, row: any) => {
                    if (err) reject(err); else resolve(row.c);
                });
            });
            expect(count).to.equal(1);
        });
    });

    describe('Retorno Nulo', () => {
        it('deve retornar null para chave inexistente', async () => {
            const valor = await configuracoesRepository.getInt('chave_fantasma');
            expect(valor).to.be.null;
        });
    });
});
