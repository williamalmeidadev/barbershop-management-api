const form = document.getElementById('login-form');
const btnLogin = document.getElementById('btn-login');
const errorContainer = document.getElementById('error-container');
const errorMsg = document.getElementById('error-msg');
const basePath = window.BASE_PATH || '';

if (form) {
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
            const msg = err.message || 'E-mail ou senha inválidos';
            errorMsg.textContent = msg;
            errorContainer.classList.remove('hidden');
            if (window.NOTIFY?.notify) {
                window.NOTIFY.notify(msg, 'error', { containerId: 'notification-container' });
            }

            btnLogin.disabled = false;
            btnLogin.innerText = originalText;
        }
    });
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        document.cookie = 'client_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.reload();
    });
}
