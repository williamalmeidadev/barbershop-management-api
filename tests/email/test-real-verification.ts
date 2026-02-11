import dotenv from 'dotenv';
import { EmailService } from '../../src/services/emailService';
import crypto from 'crypto';

dotenv.config();

async function testRealFlow() {
    const emailService = new EmailService();
    const testToken = crypto.randomBytes(32).toString('hex');

    // No seu Controller real, essa URL viria da configuração da API
    const verificationLink = `${process.env.API_URL || 'http://localhost:3333'}/auth/verify?token=${testToken}`;

    console.log('🧪 Iniciando teste de verificação real...');

    try {
        await emailService.sendVerificationEmail(
            process.env.EMAIL_USER || '',
            'Caio José (Teste)',
            testToken
        );
        console.log('✅ E-mail enviado! Confira o seu Gmail.');
        console.log(`🔗 O link gerado foi: ${verificationLink}`);
    } catch (error) {
        console.error('❌ Falha no envio:', error);
    }
}

testRealFlow();