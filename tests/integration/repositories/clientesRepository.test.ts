
import { expect } from 'chai';
import { clientesRepository } from '../../../src/repositories/clientesRepository';
import { db } from '../../../src/database/sqlite';
import { initDatabase } from '../../../src/database/init';

describe('ClientesRepository Integration', function () {
    this.timeout(5000);

    before((done) => {
        initDatabase();
        // Wait for tables to be created by queuing a simple query
        db.get('SELECT 1', (err) => {
            if (err) done(err);
            else done();
        });
    });

    beforeEach(async () => {
        await new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.run('PRAGMA foreign_keys = OFF');

                db.run('DELETE FROM agendamento_servicos');
                db.run('DELETE FROM agendamento_vagas');
                db.run('DELETE FROM agendamentos');

                db.run('DELETE FROM clientes');

                db.run('PRAGMA foreign_keys = ON', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    });

    describe('create', () => {
        it('deve inserir cliente e retornar o lastID', async () => {
            const payload = {
                nome: 'Cliente Teste',
                email: 'teste@teste.com',
                telefone: '11999999999',
                password_hash: 'hash'
            };

            const id = await clientesRepository.create(payload);
            expect(id).to.be.a('number');

            const inserted = await clientesRepository.findById(id);
            expect(inserted).to.not.be.null;
            expect(inserted!.nome).to.equal(payload.nome);
            expect(inserted!.email).to.equal(payload.email);
        });

        it('deve lançar erro de constraint ao duplicar e-mail', async () => {
            const payload = {
                nome: 'Cliente Duplicado',
                email: 'duplicado@teste.com',
                password_hash: 'hash'
            };

            await clientesRepository.create(payload);

            try {
                await clientesRepository.create(payload);
                expect.fail('Should have thrown constraint error');
            } catch (err: any) {
                expect(err.message).to.contain('SQLITE_CONSTRAINT');
            }
        });
    });

    describe('findByEmail', () => {
        it('deve retornar o cliente pelo email', async () => {
            const payload = { nome: 'Find', email: 'find@test.com', password_hash: 'h' };
            const id = await clientesRepository.create(payload);

            const result = await clientesRepository.findByEmail('find@test.com');
            expect(result).to.not.be.null;
            expect(result!.id).to.equal(id);
        });

        it('deve retornar null se email não existir', async () => {
            const result = await clientesRepository.findByEmail('naoexiste@test.com');
            expect(result).to.be.null;
        });
    });

    describe('findByEmailExcludingId', () => {
        it('deve encontrar conflito se email pertencer a outro id', async () => {
            await clientesRepository.create({ nome: 'A', email: 'a@test.com', password_hash: 'h' }); // ID 1
            const idB = await clientesRepository.create({ nome: 'B', email: 'b@test.com', password_hash: 'h' }); // ID 2

            // Busco email 'a@test.com', ignorando ID B. Existe (é do A), então retorna objeto.
            const result = await clientesRepository.findByEmailExcludingId('a@test.com', idB);
            expect(result).to.not.be.null;
        });

        it('deve retornar null se email pertencer ao próprio id', async () => {
            const id = await clientesRepository.create({ nome: 'Proprio', email: 'meu@test.com', password_hash: 'h' });

            // Busco 'meu@test.com' ignorando eu mesmo -> não deve achar outro.
            const result = await clientesRepository.findByEmailExcludingId('meu@test.com', id);
            expect(result).to.be.null;
        });
    });

    describe('list & listSimpleAtivos', () => {
        beforeEach(async () => {
            // Inserir dados mistos
            await clientesRepository.create({ nome: 'Ativo 1', email: 'a1@t.com', password_hash: 'h' });
            const idInat = await clientesRepository.create({ nome: 'Inativo 1', email: 'i1@t.com', password_hash: 'h' });
            await clientesRepository.deactivate(idInat);
        });

        it('list(1) deve retornar apenas ativos', async () => {
            const result = await clientesRepository.list(1);
            expect(result).to.have.lengthOf(1);
            expect(result[0].nome).to.equal('Ativo 1');
            expect(result[0].ativo).to.equal(1);
        });

        it('list(0) deve retornar apenas inativos', async () => {
            const result = await clientesRepository.list(0);
            expect(result).to.have.lengthOf(1);
            expect(result[0].nome).to.equal('Inativo 1');
            expect(result[0].ativo).to.equal(0);
        });

        it('listSimpleAtivos deve retornar projeção correta de ativos', async () => {
            const result = await clientesRepository.listSimpleAtivos();
            expect(result).to.have.lengthOf(1);
            expect(result[0]).to.have.keys(['id', 'nome']);
            expect(result[0].nome).to.equal('Ativo 1');
        });
    });

    describe('update & deactivate', () => {
        it('deve atualizar cliente e persistir mudança', async () => {
            const id = await clientesRepository.create({ nome: 'Original', email: 'orig@t.com', password_hash: 'h' });

            await clientesRepository.update(id, { nome: 'Atualizado' });

            const updated = await clientesRepository.findById(id);
            expect(updated!.nome).to.equal('Atualizado');
        });

        it('deve desativar cliente', async () => {
            const id = await clientesRepository.create({ nome: 'To Deactivate', email: 'd@t.com', password_hash: 'h' });

            await clientesRepository.deactivate(id);

            const updated = await clientesRepository.findById(id);
            expect(updated!.ativo).to.equal(0);
        });

        it('deve atualizar contagem e desconto', async () => {
            const id = await clientesRepository.create({ nome: 'Fidelidade', email: 'f@t.com', password_hash: 'h' });

            await clientesRepository.atualizarContagemEDesconto(id, 5, 1000);

            const cliente = await clientesRepository.findById(id);
            expect(cliente!.concluidos_count).to.equal(5);
            expect(cliente!.desconto_disponivel_centavos).to.equal(1000);
        });
    });
});
