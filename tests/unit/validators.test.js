"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const validators_1 = require("../../src/utils/validators");
describe('Validadores Utilitários (Unitário)', () => {
    // Validação de Email
    describe('isvalidEmail', () => {
        it('deve retornar true para email válido padrão', () => {
            const result = (0, validators_1.isValidEmail)('test@example.com');
            (0, chai_1.expect)(result).to.be.true;
        });
        it('deve retornar false para email sem @', () => {
            const result = (0, validators_1.isValidEmail)('testexample.com');
            (0, chai_1.expect)(result).to.be.false;
        });
        it('deve retornar false para email com espaços', () => {
            const result = (0, validators_1.isValidEmail)('test @ example.com');
            (0, chai_1.expect)(result).to.be.false;
        });
    });
    // Validação de Senha
    describe('isStrongPassword', () => {
        it('deve retornar ture para senhas com min 8 chars, com letras e números', () => {
            const result = (0, validators_1.isStrongPassword)('test1234');
            (0, chai_1.expect)(result).to.be.true;
        });
        it('deve retornar false para senha com menos de 8 chars', () => {
            const result = (0, validators_1.isStrongPassword)('test12');
            (0, chai_1.expect)(result).to.be.false;
        });
        it('deve retornar false para senhas sem letras', () => {
            const result = (0, validators_1.isStrongPassword)('123456789');
            (0, chai_1.expect)(result).to.be.false;
        });
        it('deve retornar false para senha sem números', () => {
            const result = (0, validators_1.isStrongPassword)('testpassword');
            (0, chai_1.expect)(result).to.be.false;
        });
    });
    // Validação de campos obrigatórios faltando
    describe('getMissingFields', () => {
        it('deve retornar array vazio se todos os campos estiverem presentes', () => {
            const body = { nome: 'nametest', email: 'test@test.com' };
            const required = ['nome', 'email'];
            const missing = (0, validators_1.getMissingFields)(body, required);
            (0, chai_1.expect)(missing).to.be.an('array');
            (0, chai_1.expect)(missing).to.have.lengthOf(0);
        });
        it('deve identificar campos nulos ou undefined', () => {
            const body = { nome: 'testname', email: undefined };
            const required = ['nome', 'email'];
            const missing = (0, validators_1.getMissingFields)(body, required);
            (0, chai_1.expect)(missing).to.include('email');
        });
        it('deve identificar strings vazias ou apenas espaços', () => {
            const body = { nome: '   ', email: 'test@test.com' };
            const required = ['nome'];
            const missing = (0, validators_1.getMissingFields)(body, required);
            (0, chai_1.expect)(missing).to.include('nome');
            (0, chai_1.expect)(missing).to.have.lengthOf(1);
        });
    });
});
