import { expect } from 'chai';

import { isValidEmail, isStrongPassword, getMissingFields } from '../../src/utils/validators'

describe('Validadores Utilitários (Unitário)', () => {
    // Validação de Email
    describe('isvalidEmail', () => {
        it('deve retornar true para email válido padrão', () => {
            const result = isValidEmail('test@example.com');
            expect(result).to.be.true;
        });
        
        it('deve retornar false para email sem @', () => {
            const result = isValidEmail('testexample.com');
            expect(result).to.be.false;
        });

        it('deve retornar false para email com espaços', () => {
            const result = isValidEmail('test @ example.com');
            expect(result).to.be.false;
        });
    })

    // Validação de Senha
    describe('isStrongPassword', () => {
        it('deve retornar ture para senhas com min 8 chars, com letras e números', () => {
            const result = isStrongPassword('test1234');
            expect(result).to.be.true;
        });

        it('deve retornar false para senha com menos de 8 chars', () => {
            const result = isStrongPassword('test12');
            expect(result).to.be.false;
        });

        it('deve retornar false para senhas sem letras', () => {
            const result = isStrongPassword('123456789');
            expect(result).to.be.false;
        });

        it('deve retornar false para senha sem números', () => {
            const result = isStrongPassword('testpassword');
            expect(result).to.be.false;
        });
    });

    // Validação de campos obrigatórios faltando
    describe('getMissingFields', () => {
        it('deve retornar array vazio se todos os campos estiverem presentes', () => {
            const body = { nome: 'nametest', email: 'test@test.com' };
            const required = ['nome', 'email'];
            
            const missing = getMissingFields(body, required);
            
            expect(missing).to.be.an('array'); 
            expect(missing).to.have.lengthOf(0);
        });

        it('deve identificar campos nulos ou undefined', () => {
            const body: any = { nome: 'testname', email: undefined };
            const required = ['nome', 'email'];
            
            const missing = getMissingFields(body, required);
            
            expect(missing).to.include('email');
        });

        it('deve identificar strings vazias ou apenas espaços', () => {
            const body = { nome: '   ', email: 'test@test.com' };
            const required = ['nome'];
            
            const missing = getMissingFields(body, required);
            
            expect(missing).to.include('nome');
            expect(missing).to.have.lengthOf(1);
        });
    });
});

