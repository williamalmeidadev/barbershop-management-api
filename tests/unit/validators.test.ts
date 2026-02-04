import { expect } from 'chai';

import {
    getMissingFields,
    getPasswordChecks,
    isIsoWithTimezone,
    isStrongPassword,
    isValidEmail
} from '../../src/utils/validators'

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
        it('deve retornar true para senha com no mínimo 6 chars, maiúscula, minúscula e número', () => {
            const result = isStrongPassword('Teste123');
            expect(result).to.be.true;
        });

        it('deve retornar true para senha válida no limite mínimo de 6 caracteres', () => {
            const result = isStrongPassword('Aa1bbb');
            expect(result).to.be.true;
        });

        it('deve retornar false para senha com menos de 6 chars', () => {
            const result = isStrongPassword('test12');
            expect(result).to.be.false;
        });

        it('deve retornar false para senhas sem letras maiúsculas', () => {
            const result = isStrongPassword('teste123');
            expect(result).to.be.false;
        });

        it('deve retornar false para senhas sem letras minúsculas', () => {
            const result = isStrongPassword('TESTE123');
            expect(result).to.be.false;
        });

        it('deve retornar false para senha sem números', () => {
            const result = isStrongPassword('Testepassword');
            expect(result).to.be.false;
        });
    });

    describe('getPasswordChecks', () => {
        it('deve marcar todos os checks quando a senha atende todos os critérios', () => {
            const checks = getPasswordChecks('Teste123!');
            expect(checks).to.deep.equal({
                minLength: true,
                hasLower: true,
                hasUpper: true,
                hasNumber: true,
                hasSymbol: true
            });
        });

        it('deve marcar false quando um critério não for atendido', () => {
            const checks = getPasswordChecks('abc');
            expect(checks.minLength).to.be.false;
            expect(checks.hasLower).to.be.true;
            expect(checks.hasUpper).to.be.false;
            expect(checks.hasNumber).to.be.false;
            expect(checks.hasSymbol).to.be.false;
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

    describe('isIsoWithTimezone', () => {
        it('deve retornar true para ISO com timezone Z', () => {
            const result = isIsoWithTimezone('2026-02-04T10:30:00Z');
            expect(result).to.be.true;
        });

        it('deve retornar true para ISO com offset', () => {
            const result = isIsoWithTimezone('2026-02-04T10:30:00-03:00');
            expect(result).to.be.true;
        });

        it('deve retornar false para ISO sem timezone', () => {
            const result = isIsoWithTimezone('2026-02-04T10:30:00');
            expect(result).to.be.false;
        });
    });
});
