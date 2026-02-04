const form = document.getElementById('admin-login-form');
const btnLogin = document.getElementById('btn-admin-login');
const errorContainer = document.getElementById('error-container');
const errorMsg = document.getElementById('error-msg');
const basePath = window.BASE_PATH || '';

// Do not auto-redirect here; /admin will validate via cookie.

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  errorContainer.classList.add('hidden');
  btnLogin.disabled = true;
  const originalText = btnLogin.innerText;
  btnLogin.innerText = 'Entrando...';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const data = window.API?.json
      ? await window.API.json('/auth/login/admin', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        })
      : await (async () => {
          const response = await fetch(`${basePath}/auth/login/admin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          const resData = await response.json();
          if (!response.ok) {
            throw new Error(resData.message || resData.error || 'Credenciais inválidas');
          }
          return resData;
        })();

    document.cookie = `admin_token=${encodeURIComponent(data.token)}; path=/; SameSite=Lax`;
    window.location.href = `${basePath}/admin`;
  } catch (err) {
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
