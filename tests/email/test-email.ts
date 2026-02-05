import dotenv from 'dotenv';
import { EmailService } from '../../src/services/emailService';

// Carrega as variáveis do .env
dotenv.config();

async function runTest() {
  console.log('🚀 Iniciando teste de e-mail do AlphaCuts...');
  console.log(`📧 Tentando enviar via: ${process.env.EMAIL_USER}`);

  const emailService = new EmailService();

  try {
    await emailService.sendWelcomeEmail(
      process.env.EMAIL_USER || '',
      'Caio José'
    );

    console.log('✅ Sucesso! O e-mail foi enviado. Verifique sua caixa de entrada (e o spam).');
  } catch (error: any) {
    console.error('❌ Erro no teste:');

    if (error.message.includes('Invalid login')) {
      console.error('👉 O Gmail recusou o login. Verifique se a "Senha de App" tem 16 letras e está correta.');
    } else if (error.code === 'ENOENT') {
      console.error('👉 O Node não encontrou o arquivo HTML. Verifique se a pasta "templates/email" está no lugar certo.');
    } else {
      console.error(error);
    }
  }
}

runTest();