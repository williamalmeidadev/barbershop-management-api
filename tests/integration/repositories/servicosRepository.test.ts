
import { expect } from 'chai';
import { servicoRepository } from '../../../src/repositories/servicosRepository';
import { db } from '../../../src/database/sqlite';
import { initDatabase } from '../../../src/database/init';

describe('ServicosRepository Integration', function () {
    this.timeout(5000);

    let barbeiroId: number;

    before((done) => {
        initDatabase();
        db.get('SELECT 1', (err) => {
            if (err) done(err);
            else done();
        });
    });

    beforeEach(async () => {
        await new Promise<void>((resolve, reject) => {
            const tables = ['agendamento_servicos', 'agendamento_vagas', 'agendamentos', 'vagas', 'servicos', 'barbeiros'];
            let index = 0;

            const runNext = () => {
                if (index >= tables.length) return resolve();
                const table = tables[index++];
                db.run(`DELETE FROM ${table}`, (err) => {
                    if (err) return reject(err);
                    runNext();
                });
            };

            runNext();
        });

        barbeiroId = await new Promise<number>((resolve, reject) => {
            db.run(`INSERT INTO barbeiros (nome_profissional, ativo) VALUES ('Barb Test', 1)`, function (err) {
                if (err) reject(err); else resolve(this.lastID);
            });
        });
    });

    describe('CRUD Básico', () => {
        it('deve criar, buscar, atualizar e desativar um serviço', async () => {
            // Criar
            const criado = await servicoRepository.create({
                barbeiro_id: barbeiroId,
                nome: 'Corte',
                descricao: 'Corte simples',
                duracao_minutos: 30,
                preco_centavos: 3000,
                ativo: 1
            });
            expect(criado).to.have.property('id');
            expect(criado.nome).to.equal('Corte');
            expect(criado.barbeiro_id).to.equal(barbeiroId);

            // Buscar por ID
            const encontrado = await servicoRepository.findById(criado.id);
            expect(encontrado).to.not.be.null;
            expect(encontrado!.id).to.equal(criado.id);

            // Atualizar
            const atualizado = await servicoRepository.update(criado.id, {
                nome: 'Corte Premium',
                preco_centavos: 5000
            });
            expect(atualizado.nome).to.equal('Corte Premium');
            expect(atualizado.preco_centavos).to.equal(5000);

            // Desativar
            const desativado = await servicoRepository.deactivate(criado.id);
            expect(desativado.ativo).to.equal(0);
        });
    });

    describe('Listagem', () => {
        it('deve filtrar corretamente por status', async () => {
            // Setup
            await servicoRepository.create({ barbeiro_id: barbeiroId, nome: 'Ativo 1', duracao_minutos: 10, preco_centavos: 100, ativo: 1 });
            await servicoRepository.create({ barbeiro_id: barbeiroId, nome: 'Ativo 2', duracao_minutos: 10, preco_centavos: 100, ativo: 1 });
            await servicoRepository.create({ barbeiro_id: barbeiroId, nome: 'Inativo 1', duracao_minutos: 10, preco_centavos: 100, ativo: 0 });

            // list(1) - Apenas ativos
            const ativos = await servicoRepository.list(1);
            expect(ativos).to.have.lengthOf(2);
            ativos.forEach(s => expect(s.ativo).to.equal(1));

            // list(0) - Apenas inativos
            const inativos = await servicoRepository.list(0);
            expect(inativos).to.have.lengthOf(1);
            expect(inativos[0].ativo).to.equal(0);

            // list() - Todos
            const todos = await servicoRepository.list();
            expect(todos).to.have.lengthOf(3);
        });
    });

    describe('Busca em Lote', () => {
        it('deve buscar serviços ativos por lista de IDs', async () => {
            const s1 = await servicoRepository.create({ barbeiro_id: barbeiroId, nome: 'S1', duracao_minutos: 10, preco_centavos: 100, ativo: 1 });
            const s2 = await servicoRepository.create({ barbeiro_id: barbeiroId, nome: 'S2', duracao_minutos: 10, preco_centavos: 100, ativo: 1 });
            const s3 = await servicoRepository.create({ barbeiro_id: barbeiroId, nome: 'S3', duracao_minutos: 10, preco_centavos: 100, ativo: 0 }); // Inativo

            const encontrados = await servicoRepository.findByIds([s1.id, s2.id, s3.id]);

            // O repositório filtra por ativo=1
            expect(encontrados).to.have.lengthOf(2);
            const ids = encontrados.map(s => s.id);
            expect(ids).to.include(s1.id);
            expect(ids).to.include(s2.id);
            expect(ids).to.not.include(s3.id);
        });
    });
});
