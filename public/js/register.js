const form = document.getElementById('register-form');
const btnRegister = document.getElementById('btn-register');
const errorContainer = document.getElementById('error-container');
const errorMsg = document.getElementById('error-msg');
const basePath = window.BASE_PATH || '';

// Password Validation Logic
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm_password');
const reqList = document.getElementById('password-requirements');

if (passwordInput && reqList) {
    reqList.classList.remove('hidden');

    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validatePassword);

    function validatePassword() {
        const val = passwordInput.value;
        const confirmVal = confirmPasswordInput.value;

        // Requirements
        const hasCapital = /[A-Z]/.test(val);
        const hasNumber = /[0-9]/.test(val);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(val);
        const hasLength = val.length >= 6;

        // Match Requirement: Valid if both are non-empty and equal
        // Or should we only check if confirm is non-empty? 
        // Let's say: Match is valid if confirm == password AND password is not empty
        const hasMatch = val && confirmVal && (val === confirmVal);

        updateReq('req-capital', hasCapital);
        updateReq('req-number', hasNumber);
        updateReq('req-symbol', hasSymbol);
        updateReq('req-length', hasLength);
        updateReq('req-match', hasMatch);
    }
}

function updateReq(id, isValid) {
    const el = document.getElementById(id);
    if (!el) return;
    if (isValid) {
        el.classList.add('valid');
        el.querySelector('.material-icons').innerText = 'check_circle';
    } else {
        el.classList.remove('valid');
        el.querySelector('.material-icons').innerText = 'radio_button_unchecked';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Validar Senhas
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasLength = password.length >= 6;

    if (!hasCapital || !hasNumber || !hasSymbol || !hasLength) {
        showError('A senha deve atender a todos os requisitos.');
        return;
    }

    if (password !== confirmPassword) {
        showError('As senhas não coincidem.');
        confirmPasswordInput.classList.add('input-error');
        return;
    } else {
        confirmPasswordInput.classList.remove('input-error');
    }

    // 2. Feedback Visual
    errorContainer.classList.add('hidden');
    btnRegister.disabled = true;
    const originalText = btnRegister.innerText;
    btnRegister.innerText = 'Cadastrando...';

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone')?.value;

    try {
        await window.services.register(nome, email, password, telefone);

        btnRegister.innerText = 'Sucesso! Redirecionando...';
        setTimeout(() => {
            window.location.href = `${basePath}/login`;
        }, 1000);

    } catch (err) {
        console.error(err);
        showError(err.message || 'Erro ao realizar cadastro.');
        btnRegister.disabled = false;
        btnRegister.innerText = originalText;
    }
});

function showError(msg) {
    errorMsg.textContent = msg;
    errorContainer.classList.remove('hidden');
    if (window.NOTIFY?.notify) {
        window.NOTIFY.notify(msg, 'error', { containerId: 'notification-container' });
    }
}
