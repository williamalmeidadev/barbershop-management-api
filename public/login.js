const form = document.getElementById('login-form');
const btnLogin = document.getElementById('btn-login');
const errorContainer = document.getElementById('error-container');
const errorMsg = document.getElementById('error-msg');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorContainer.classList.add('hidden');
    btnLogin.disabled = true;
    const originalText = btnLogin.innerText;
    btnLogin.innerText = 'Entrando...';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await window.services.login(email, password);
        
        btnLogin.innerText = 'Sucesso!';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);

    } catch (err) {
        console.error(err);
        errorMsg.textContent = err.message || 'E-mail ou senha inválidos';
        errorContainer.classList.remove('hidden');
        
        btnLogin.disabled = false;
        btnLogin.innerText = originalText;
    }
});