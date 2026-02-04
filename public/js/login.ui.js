(function () {
  const basePath = window.BASE_PATH || '';
  const { renderAuthPage } = window.LAYOUT || {};
  const { createAuthForm, createAuthErrorBox, createAuthFooter } = window.FORMS || {};

  if (!renderAuthPage || !createAuthForm || !createAuthErrorBox || !createAuthFooter) return;

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const renderPage = () => {
    const token = getCookie('client_token');

    if (token) {
      const container = document.createElement('div');
      container.className = 'card';
      container.style.maxWidth = '400px';
      container.style.margin = '0 auto';
      container.style.textAlign = 'center';
      container.innerHTML = `
          <div style="margin-bottom: 24px;">
              <div style="width: 80px; height: 80px; background: rgba(242, 93, 39, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border: 1px solid var(--primary);">
                <i class="material-icons" style="font-size: 40px; color: var(--primary);">person</i>
              </div>
              <h3 style="color: var(--text); font-size: 1.5rem; margin-bottom: 8px;">Bem-vindo de volta!</h3>
              <p style="color: var(--text-muted); margin: 0;">Você já está conectado.</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
              <a href="${basePath}/app" class="cta-button" style="width: 100%; text-align: center; justify-content: center;">
                  Ir para o Início
              </a>
              <button id="btn-logout" class="nav-button" style="width: 100%; cursor: pointer;">
                  Sair da conta
              </button>
          </div>
      `;

      renderAuthPage({
        navLinks: [],
        title: 'Bem-vindo de volta',
        subtitle: 'Continue para o aplicativo',
        bodyNodes: [container],
        footerNote: '© 2026 AlphaCuts. Todos os direitos reservados.'
      });
    } else {
      const { form } = createAuthForm({
        id: 'login-form',
        submitId: 'btn-login',
        submitLabel: 'Acessar Conta',
        fields: [
          { id: 'email', name: 'email', label: 'E-mail', type: 'email', placeholder: 'Email', required: true },
          { id: 'password', name: 'password', label: 'Senha', type: 'password', placeholder: 'Sua senha secreta', required: true }
        ]
      });

      const errorBox = createAuthErrorBox('Credenciais inválidas');
      const footer = createAuthFooter({
        text: 'Ainda não tem conta?',
        linkText: 'Criar conta grátis',
        href: `${basePath}/register`
      });

      const adminLink = document.createElement('a');
      adminLink.className = 'auth-admin-link';
      adminLink.href = `${basePath}/admin-login`;
      adminLink.textContent = 'Acesso Administrativo';

      renderAuthPage({
        navLinks: [{ href: `${basePath}/`, label: 'Voltar ao Início', className: 'nav-link' }],
        title: 'Bem-vindo',
        subtitle: 'Acesse sua conta para continuar',
        bodyNodes: [form, errorBox, footer, adminLink],
        footerNote: '© 2026 AlphaCuts. Todos os direitos reservados.'
      });
    }
  };

  // Initial render
  renderPage();

  // Re-render on page show (back/forward cache)
  window.addEventListener('pageshow', (event) => {
    // If persisted (BFCache) or just standard nav, check correct state
    // We force a check to ensure UI matches cookie state
    renderPage();
  });
})();
