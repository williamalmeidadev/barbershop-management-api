document.addEventListener('DOMContentLoaded', async () => {
    const { createEl, appendChildren, createAppHeader, renderFooter, createThemeToggle, createFooter } = window.LAYOUT;
    const { json } = window.API;
    const { getCookieValue } = window.APP_UTILS || {};

    // Auth Check
    const token = getCookieValue ? getCookieValue('client_token') : null;
    if (!token) {
        window.location.replace('login');
        return;
    }

    const app = document.getElementById('app');

    // --- LAYOUT FIX: Ensure footer sticks to bottom ---
    // Modify App Container to flex column
    if (app) {
        app.style.minHeight = '100vh';
        app.style.display = 'flex';
        app.style.flexDirection = 'column';
    }

    // Header
    const header = createAppHeader({ basePath: '.', showAppointments: true });

    // Main Content
    // Added flex: 1 to push footer down
    const main = createEl('main', {
        className: 'container',
        attrs: {
            style: 'flex: 1; padding-top: 2rem; padding-bottom: 2rem; max-width: 600px; width: 100%; align-self: center;'
        }
    });

    // Title
    const title = createEl('h2', { text: 'Meu Perfil', attrs: { style: 'margin-bottom: 1.5rem;' } });
    main.appendChild(title);

    // Form Container (Styled Code)
    const card = createEl('div', {
        className: 'card',
        attrs: {
            style: `
                padding: 2.5rem; 
                background: var(--surface); 
                border: 1px solid var(--border); 
                border-radius: 14px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            `
        }
    });

    // Form Inputs
    const form = createEl('form', { attrs: { id: 'profile-form' } });

    const createInputGroup = (label, name, type = 'text', value = '', required = true) => {
        const group = createEl('div', { className: 'form-group', attrs: { style: 'margin-bottom: 1.2rem;' } });
        group.appendChild(createEl('label', {
            text: label,
            attrs: {
                for: name,
                style: 'display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem;'
            }
        }));

        const inputAttrs = {
            type, name, id: name, value,
            style: `
                width: 100%; 
                padding: 0.9rem; 
                border-radius: 8px; 
                border: 1px solid var(--border); 
                background: var(--background); 
                color: var(--text);
                outline: none;
                font-size: 1rem;
                transition: border-color 0.2s;
            `
        };

        if (required) inputAttrs.required = 'true';

        const input = createEl('input', {
            className: 'input-field',
            attrs: inputAttrs
        });

        // Add focus effect
        input.addEventListener('focus', () => input.style.borderColor = 'var(--primary, #f25d27)');
        input.addEventListener('blur', () => input.style.borderColor = 'rgba(255, 255, 255, 0.1)');

        group.appendChild(input);
        return group;
    };

    // Load User Data
    let userData = {};
    try {
        userData = await json('/clientes/me', { method: 'GET' });
    } catch (err) {
        console.error(err);
        showNotification('Erro ao carregar perfil.', 'error');
    }

    const nameGroup = createInputGroup('Nome', 'nome', 'text', userData.nome || '', true);
    const emailGroup = createInputGroup('E-mail', 'email', 'email', userData.email || '', true);
    const phoneGroup = createInputGroup('Telefone', 'telefone', 'tel', userData.telefone || '', false);

    form.appendChild(nameGroup);
    form.appendChild(emailGroup);
    form.appendChild(phoneGroup);

    // Actions
    const actions = createEl('div', { attrs: { style: 'display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;' } });

    const saveBtn = createEl('button', {
        text: 'Salvar Alterações',
        className: 'cta-button', // Updated Class
        attrs: {
            type: 'submit',
            style: 'flex: 1; justify-content: center; cursor: pointer;'
        }
    });

    const deleteBtn = createEl('button', {
        text: 'Excluir Conta',
        className: 'btn-danger',
        attrs: {
            type: 'button',
            style: `
                flex: 1; 
                background-color: #ef4444; 
                color: white; 
                border: none; 
                padding: 1rem; 
                border-radius: 12px; 
                cursor: pointer; 
                font-weight: 600;
                transition: background 0.2s;
            `
        }
    });

    deleteBtn.addEventListener('mouseover', () => deleteBtn.style.backgroundColor = '#dc2626');
    deleteBtn.addEventListener('mouseout', () => deleteBtn.style.backgroundColor = '#ef4444');

    actions.appendChild(saveBtn);
    actions.appendChild(deleteBtn);
    form.appendChild(actions);

    card.appendChild(form);
    main.appendChild(card);

    // Footer
    const footer = createFooter();

    appendChildren(app, [header, main, footer]);


    // Event Listeners
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalText = saveBtn.innerText;
        saveBtn.innerText = 'Salvando...';
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.7';

        const payload = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
        };

        try {
            await json('/clientes/me', { method: 'PUT', body: JSON.stringify(payload) });
            showNotification('Perfil atualizado com sucesso!');
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            saveBtn.innerText = originalText;
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        }
    });

    deleteBtn.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) return;

        const originalText = deleteBtn.innerText;
        deleteBtn.innerText = 'Excluindo...';
        deleteBtn.disabled = true;
        deleteBtn.style.opacity = '0.7';

        try {
            await json('/clientes/me', { method: 'DELETE' });
            document.cookie = 'client_token=; Max-Age=0; path=/; SameSite=Lax';
            showNotification('Conta excluída. Redirecionando...');
            setTimeout(() => {
                window.location.replace('/');
            }, 2000);
        } catch (err) {
            showNotification(err.message, 'error');
            deleteBtn.innerText = originalText;
            deleteBtn.disabled = false;
        }
    });

    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        const note = document.createElement('div');
        note.className = `notification ${type}`;
        note.innerText = message;
        note.style.cssText = `
            position: fixed; top: 90px; right: 20px; padding: 1rem 1.5rem; 
            background: ${type === 'success' ? '#10b981' : '#ef4444'}; 
            color: white; border-radius: 8px; z-index: 1100; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            font-weight: 500; animation: slideIn 0.3s ease-out;
        `;
        container.appendChild(note);
        setTimeout(() => {
            note.style.opacity = '0';
            note.style.transform = 'translateX(100%)';
            note.style.transition = 'all 0.3s ease';
            setTimeout(() => note.remove(), 300);
        }, 3000);
    }

    // Active Link Highlight
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => l.classList.remove('active'));

    // --- NEW: Handle Auth State for Header ---
    if (token) {
        // Find the "Login" button created by layout.js
        const authBtn = document.getElementById('auth-action');
        if (authBtn) {
            authBtn.innerText = 'Sair';
            authBtn.removeAttribute('href'); // Prevent default navigation
            authBtn.style.cursor = 'pointer';

            authBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Logout Logic
                document.cookie = 'client_token=; Max-Age=0; path=/; SameSite=Lax';
                window.location.replace(`${window.BASE_PATH || ''}/login`);
            });
        }
    }

    // --- NEW: Fix Navigation Links (Redirect to main App) ---
    const handleNavClick = (id, targetPath) => {
        const link = document.getElementById(id);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const basePath = window.BASE_PATH || '';
                window.location.href = `${basePath}/app${targetPath}`;
            });
        }
    };

    handleNavClick('nav-home', '#home');
    handleNavClick('nav-appointments', '#appointments');
    handleNavClick('nav-about', '#about');

});
