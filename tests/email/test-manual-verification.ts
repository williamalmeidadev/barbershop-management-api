import dotenv from 'dotenv';
dotenv.config();

import { clientesService } from '../../src/services/clientesService';
import { clientesRepository } from '../../src/repositories/clientesRepository';
import { EmailService } from '../../src/services/emailService';

async function testManualVerification() {
    console.log('🚀 Preparando teste manual de verificação...');


    // Create unique email to avoid conflicts
    const timestamp = Date.now();
    const email = `teste_manual_${timestamp}@test.com`;
    const password = 'Password123!';
    const nome = `Teste Manual ${timestamp}`;

    console.log(`👤 Criando usuário: ${email}`);

    try {
        // 1. Create User
        const { clienteId } = await clientesService.criar({
            nome,
            email,
            password,
            telefone: '11999999999'
        });

        // 2. Get Token from DB
        const cliente = await clientesRepository.findById(clienteId);

        if (!cliente || !cliente.verification_token) {
            console.error('❌ Erro: Cliente criado mas sem token!');
            return;
        }

        console.log('✅ Usuário criado no banco de dados.');
        console.log(`🔑 Token salvo: ${cliente.verification_token}`);

        // 3. Send Email
        const emailService = new EmailService();
        await emailService.sendVerificationEmail(
            process.env.EMAIL_USER || '', // Send to the dev's email (configured in .env)
            nome,
            cliente.verification_token
        );

        console.log('\n✅ E-mail enviado com sucesso!');
        console.log(`📧 Cheque a caixa de entrada de: ${process.env.EMAIL_USER}`);
        console.log('🔗 Link esperado (também está no email):');
        console.log(`${process.env.API_URL || 'http://localhost:3333'}/auth/verify?token=${cliente.verification_token}`);
        console.log('\n⚠️  AGORA: Clique no link recebido por e-mail para validar o teste.');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testManualVerification();
