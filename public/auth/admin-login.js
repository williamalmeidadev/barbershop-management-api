const form = document.getElementById('admin-login-form');
const error = document.getElementById('error');
const basePath = window.BASE_PATH || '';

// Do not auto-redirect here; /admin will validate via cookie.

form.addEventListener('submit', async (event) => {
  event.preventDefault();

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

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    document.cookie = `admin_token=${encodeURIComponent(data.token)}; path=/; SameSite=Lax`;
    window.location.href = `${basePath}/admin`;
  } catch (err) {
    error.textContent = err.message || 'E-mail ou senha inválidos';
  }
});
