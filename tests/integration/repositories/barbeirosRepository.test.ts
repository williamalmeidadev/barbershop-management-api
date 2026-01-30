
import { expect } from 'chai';
import { barbeirosRepository } from '../../../src/repositories/barbeirosRepository';
import { db } from '../../../src/database/sqlite';
import { initDatabase } from '../../../src/database/init';

describe('BarbeirosRepository Integration', function () {
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
            db.serialize(() => {
                db.run('PRAGMA foreign_keys = OFF');
                db.run('DELETE FROM agendamentos');
                db.run('DELETE FROM vagas');
                db.run('DELETE FROM barbeiros');
                db.run('PRAGMA foreign_keys = ON', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    });

    describe('Ciclo de Vida Completo', () => {
        it('deve criar, atualizar e desativar um barbeiro', async () => {
            // Criar
            const criado = await barbeirosRepository.criar({
                nome_profissional: 'João Barbeiro',
                bio: 'Especialista em cortes clássicos',
                ativo: 1
            });
            expect(criado).to.have.property('id');
            expect(criado.id).to.be.a('number');
            expect(criado.nome_profissional).to.equal('João Barbeiro');
            expect(criado.bio).to.equal('Especialista em cortes clássicos');

            // Atualizar
            const atualizado = await barbeirosRepository.atualizar(criado.id, {
                nome_profissional: 'João Silva',
                bio: null // Removendo bio
            });
            expect(atualizado.nome_profissional).to.equal('João Silva');
            expect(atualizado.bio).to.be.null;

            // Desativar
            const desativado = await barbeirosRepository.desativar(criado.id);
            expect(desativado.ativo).to.equal(0);

            // Verificar persistência final
            const noBanco = await barbeirosRepository.buscarPorId(criado.id);
            expect(noBanco!.ativo).to.equal(0);
        });
    });

    describe('Listagem e Filtros', () => {
        it('deve filtrar corretamente por status ativo/inativo', async () => {
            // Setup
            await barbeirosRepository.criar({ nome_profissional: 'B1', ativo: 1 });
            await barbeirosRepository.criar({ nome_profissional: 'B2', ativo: 1 });
            await barbeirosRepository.criar({ nome_profissional: 'B3', ativo: 0 });

            // listar(1) - Ativos
            const ativos = await barbeirosRepository.listar(1);
            expect(ativos).to.have.lengthOf(2);
            ativos.forEach(b => expect(b.ativo).to.equal(1));

            // listar(0) - Inativos
            const inativos = await barbeirosRepository.listar(0);
            expect(inativos).to.have.lengthOf(1);
            expect(inativos[0].ativo).to.equal(0);

            // listar() - Todos
            const todos = await barbeirosRepository.listar();
            expect(todos).to.have.lengthOf(3);
        });
    });

    describe('Tratamento de Erro', () => {
        it('deve lançar erro ao tentar atualizar ID inexistente', async () => {
            try {
                await barbeirosRepository.atualizar(99999, { nome_profissional: 'Fantasma' });
                expect.fail('Deveria ter lançado erro');
            } catch (err: any) {
                expect(err.message).to.equal('Barbeiro não encontrado.');
            }
        });
    });
});
