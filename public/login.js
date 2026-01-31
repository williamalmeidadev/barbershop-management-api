const form = document.getElementById('login-form');
const btnLogin = document.getElementById('btn-login');
const errorContainer = document.getElementById('error-container');
const errorMsg = document.getElementById('error-msg');
const basePath = window.BASE_PATH || '';

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorContainer.classList.add('hidden');
    btnLogin.disabled = true;
    const originalText = btnLogin.innerText;
    btnLogin.innerText = 'Entrando...';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const data = await window.services.login(email, password);
        document.cookie = `client_token=${encodeURIComponent(data.token)}; path=/; SameSite=Lax`;
        
        btnLogin.innerText = 'Sucesso!';
        setTimeout(() => {
            window.location.href = `${basePath}/app`;
        }, 500);

    } catch (err) {
        console.error(err);
        errorMsg.textContent = err.message || 'E-mail ou senha inválidos';
        errorContainer.classList.remove('hidden');
        
        btnLogin.disabled = false;
        btnLogin.innerText = originalText;
    }
});
