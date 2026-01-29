const form = document.getElementById('register-form');
const error = document.getElementById('error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const telefone = document.getElementById('telefone')?.value;

    try {
        await window.services.register(nome, email, password, telefone);
        window.location.href = 'login.html';
    } catch (err) {
        error.textContent = err instanceof Error
            ? err.message
            : 'Erro no cadastro';
    }
});
