const form = document.getElementById('register-form');
const btnRegister = document.getElementById('btn-register');
const errorContainer = document.getElementById('error-container');
const errorMsg = document.getElementById('error-msg');
const basePath = window.BASE_PATH || '';
const passwordInput = document.getElementById('password');

const PASSWORD_MIN_LENGTH = 6;

function getPasswordChecks(password) {
    return {
        minLength: password.length >= PASSWORD_MIN_LENGTH,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSymbol: /[^A-Za-z0-9]/.test(password),
    };
}

function getPasswordStrength(password) {
    const checks = getPasswordChecks(password);
    const score = Object.values(checks).filter(Boolean).length;

    if (!password) return { score: 0, label: 'Digite uma senha', tone: 'neutral', checks };
    if (score <= 2) return { score, label: 'Fraca', tone: 'weak', checks };
    if (score === 3) return { score, label: 'Média', tone: 'medium', checks };
    if (score === 4) return { score, label: 'Forte', tone: 'strong', checks };
    return { score, label: 'Muito forte', tone: 'very-strong', checks };
}

function isBackendValidPassword(password) {
    const checks = getPasswordChecks(password);
    return checks.minLength && checks.hasLower && checks.hasUpper && checks.hasNumber;
}

function mountPasswordFeedback() {
    if (!passwordInput) return null;
    const formGroup = passwordInput.closest('.form-group');
    if (!formGroup) return null;

    const wrap = document.createElement('div');
    wrap.className = 'password-feedback';
    wrap.innerHTML = `
      <div class="password-meter" aria-hidden="true">
        <div class="password-meter-fill" id="password-meter-fill"></div>
      </div>
      <p class="password-strength-label" id="password-strength-label">Digite uma senha</p>
      <ul class="password-checklist" id="password-checklist">
        <li data-check="minLength">Mínimo de ${PASSWORD_MIN_LENGTH} caracteres</li>
        <li data-check="hasLower">Uma letra minúscula</li>
        <li data-check="hasUpper">Uma letra maiúscula</li>
        <li data-check="hasNumber">Um número</li>
      </ul>
    `;

    formGroup.appendChild(wrap);
    return wrap;
}

function mountPasswordToggle() {
    if (!passwordInput) return;
    const formGroup = passwordInput.closest('.form-group');
    if (!formGroup) return;

    formGroup.classList.add('has-password-toggle');

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Mostrar senha');
    toggleBtn.innerHTML = '<span class="material-icons">visibility</span>';

    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
        toggleBtn.innerHTML = `<span class="material-icons">${isPassword ? 'visibility_off' : 'visibility'}</span>`;
    });

    const updateTogglePosition = () => {
        const top = passwordInput.offsetTop + (passwordInput.offsetHeight / 2);
        toggleBtn.style.top = `${top}px`;
    };

    formGroup.appendChild(toggleBtn);

    updateTogglePosition();
    window.addEventListener('resize', updateTogglePosition);
}

mountPasswordToggle();

const passwordFeedbackEl = mountPasswordFeedback();
const passwordMeterFill = document.getElementById('password-meter-fill');
const passwordStrengthLabel = document.getElementById('password-strength-label');
const passwordChecklist = document.getElementById('password-checklist');

function updatePasswordFeedback(password) {
    if (!passwordFeedbackEl || !passwordMeterFill || !passwordStrengthLabel || !passwordChecklist) return;
    const { score, label, tone, checks } = getPasswordStrength(password);
    const percent = Math.min(100, Math.max(8, Math.round((score / 4) * 100)));

    passwordFeedbackEl.dataset.tone = tone;
    passwordMeterFill.style.width = `${percent}%`;
    passwordStrengthLabel.textContent = label;

    Array.from(passwordChecklist.querySelectorAll('li')).forEach((item) => {
        const key = item.getAttribute('data-check');
        const isValid = key ? checks[key] : false;
        item.classList.toggle('is-valid', Boolean(isValid));
    });
}

if (passwordInput) {
    updatePasswordFeedback(passwordInput.value || '');
    passwordInput.addEventListener('input', (event) => {
        updatePasswordFeedback(event.target.value || '');
    });
}

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

    if (!isBackendValidPassword(password)) {
        const msg = `Senha fraca. Use no mínimo ${PASSWORD_MIN_LENGTH} caracteres, com letra maiúscula, minúscula e número.`;
        errorMsg.textContent = msg;
        errorContainer.classList.remove('hidden');
        btnRegister.disabled = false;
        btnRegister.innerText = originalText;
        return;
    }

    try {
        await window.services.register(nome, email, password, telefone);

        btnRegister.innerText = 'Sucesso! Redirecionando...';
        setTimeout(() => {
            setTimeout(() => {
                window.location.href = `${basePath}/verify-email`;
            }, 1000);
        }, 1000);

    } catch (err) {
        console.error(err);
        const msg = err.message || 'Erro ao realizar cadastro.';
        errorMsg.textContent = msg;
        errorContainer.classList.remove('hidden');
        if (window.NOTIFY?.notify) {
            window.NOTIFY.notify(msg, 'error', { containerId: 'notification-container' });
        }

        btnRegister.disabled = false;
        btnRegister.innerText = originalText;
    }
});
