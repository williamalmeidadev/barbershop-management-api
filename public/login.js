const form = document.getElementById('login-form');
const error = document.getElementById('error');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await window.services.login(email, password);
        window.location.href = '/';
    } catch (err) {
        error.textContent = err.message || 'E-mail ou senha inválidos';
    }
});
