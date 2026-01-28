async function register(email: string, password: string) {
  const response = await fetch('http://localhost:3333/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      role: 'CLIENT',
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao cadastrar');
  }
}

const form = document.getElementById('register-form') as HTMLFormElement;
const error = document.getElementById('error') as HTMLParagraphElement;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;

  try {
    await register(email, password);
    window.location.href = 'login.html';
  } catch {
    error.textContent = 'Erro no cadastro';
  }
});