import { login } from './services/auth';

const form = document.getElementById('login-form') as HTMLFormElement;
const error = document.getElementById('error') as HTMLParagraphElement;

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;

  try {
    await login(email, password);
    window.location.href = '/server08/app';
  } catch {
    error.textContent = 'E-mail ou senha inválidos';
  }
});
