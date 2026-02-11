
import dotenv from 'dotenv';
dotenv.config();
import { clientesService } from '../../src/services/clientesService';
import { clientesRepository } from '../../src/repositories/clientesRepository';

async function testVerification() {
    console.log('🚀 Iniciando teste de fluxo de verificação...');

    const email = `teste_verify_${Date.now()}@test.com`;
    const nome = 'Usuario Teste';
    const password = 'Password123';

    console.log(`👤 Criando cliente: ${email}`);

    try {
        const { clienteId } = await clientesService.criar({
            nome,
            email,
            password,
            telefone: '1199999999'
        });
        console.log(`✅ Cliente criado com ID: ${clienteId}`);

        const cliente = await clientesRepository.findById(clienteId);
        if (!cliente) throw new Error('Cliente não encontrado');

        console.log(`🔒 Status atual: is_verified=${cliente.is_verified}, token=${cliente.verification_token ? 'OK' : 'MISSING'}`);

        if (cliente.is_verified) {
            console.error('❌ Erro: Cliente já nasceu verificado!');
        } else {
            console.log('✅ Cliente nasceu NÃO verificado (correto).');
        }

        if (!cliente.verification_token) {
            console.error('❌ Erro: Token não gerado!');
            return;
        }

        console.log('🔄 Simulando verificação...');
        await clientesService.verificarCadastro(cliente.verification_token);

        const clienteVerificado = await clientesRepository.findById(clienteId);
        if (clienteVerificado?.is_verified) {
            console.log('✅ Sucesso! Cliente agora está verificado.');
        } else {
            console.error('❌ Falha: Cliente continua não verificado.');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testVerification();
