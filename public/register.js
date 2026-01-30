const form = document.getElementById('register-form');
const btnRegister = document.getElementById('btn-register');
const errorContainer = document.getElementById('error-container');
const errorMsg = document.getElementById('error-msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Feedback Visual
    errorContainer.classList.add('hidden');
    btnRegister.disabled = true;
    const originalText = btnRegister.innerText;
    btnRegister.innerText = 'Cadastrando...';

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const telefone = document.getElementById('telefone')?.value;

    try {
        await window.services.register(nome, email, password, telefone);

        btnRegister.innerText = 'Sucesso! Redirecionando...';
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);

    } catch (err) {
        console.error(err);
        errorMsg.textContent = err.message || 'Erro ao realizar cadastro.';
        errorContainer.classList.remove('hidden');
        
        btnRegister.disabled = false;
        btnRegister.innerText = originalText;
    }
});
