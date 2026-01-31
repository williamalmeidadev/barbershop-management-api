async function register(
    nome: string,
    email: string,
    password: string,
    telefone?: string
) {
    const response = await fetch('/server08/clientes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nome,
            email,
            password,
            telefone: telefone || null,
        }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao cadastrar');
    }
}

const form = document.getElementById('register-form') as HTMLFormElement;
const error = document.getElementById('error') as HTMLParagraphElement;

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = (document.getElementById('nome') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const telefone = (document.getElementById('telefone') as HTMLInputElement)?.value;

    try {
        await register(nome, email, password, telefone);
        window.location.href = '/server08/login';
    } catch (err) {
        error.textContent = err instanceof Error
            ? err.message
            : 'Erro no cadastro';
    }
});
