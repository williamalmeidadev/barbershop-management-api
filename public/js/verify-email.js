
const btnResend = document.getElementById('btn-resend');
const emailInput = document.getElementById('resend-email');
const countdownDisplay = document.getElementById('countdown-display');
const notificationContainer = document.getElementById('notification-container');
const basePath = window.BASE_PATH || '';

let countdownInterval;

function startCountdown(seconds) {
    btnResend.disabled = true;
    countdownDisplay.classList.remove('hidden');
    let remaining = seconds;

    updateDisplay(remaining);

    countdownInterval = setInterval(() => {
        remaining--;
        updateDisplay(remaining);

        if (remaining <= 0) {
            clearInterval(countdownInterval);
            btnResend.disabled = false;
            countdownDisplay.classList.add('hidden');
            btnResend.innerText = 'Reenviar E-mail';
        }
    }, 1000);
}

function updateDisplay(seconds) {
    btnResend.innerText = `Reenviar em ${seconds}s`;
    countdownDisplay.innerText = `Aguarde ${seconds} segundos para tentar novamente.`;
}

function notify(message, type = 'info') {
    if (window.NOTIFY && window.NOTIFY.notify) {
        window.NOTIFY.notify(message, type, { containerId: 'notification-container' });
    } else {
        alert(message);
    }
}

btnResend.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) {
        notify('Por favor, digite seu e-mail.', 'error');
        return;
    }

    btnResend.disabled = true;
    btnResend.innerText = 'Enviando...';

    try {
        const response = await fetch(`${basePath}/auth/resend-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            notify(data.message || 'E-mail de verificação reenviado!', 'success');
            startCountdown(60);
        } else {
            throw new Error(data.error || 'Erro ao reenviar e-mail.');
        }

    } catch (error) {
        console.error(error);
        notify(error.message, 'error');
        btnResend.disabled = false;
        btnResend.innerText = 'Reenviar E-mail';
    }
});
