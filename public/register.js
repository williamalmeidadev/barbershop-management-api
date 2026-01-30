const form = document.getElementById('register-form');
const error = document.getElementById('error');

function showNotification(message, type = 'success') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    const note = document.createElement('div');
    note.className = `notification ${type}`;
    note.textContent = message;
    container.appendChild(note);
    setTimeout(() => note.remove(), 3500);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const telefone = document.getElementById('telefone')?.value;

    try {
        await window.services.register(nome, email, password, telefone);
        error.textContent = '';
        showNotification('Cadastro realizado com sucesso!');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1200);
    } catch (err) {
        error.textContent = err instanceof Error
            ? err.message
            : 'Erro no cadastro';
        showNotification(error.textContent, 'error');
    }
});
