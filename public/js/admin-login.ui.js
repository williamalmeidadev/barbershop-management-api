(function () {
  const basePath = window.BASE_PATH || '';
  const { renderAuthPage } = window.LAYOUT || {};
  const { createAuthForm, createAuthErrorBox } = window.FORMS || {};

  if (!renderAuthPage || !createAuthForm || !createAuthErrorBox) return;

  const { form } = createAuthForm({
    id: 'admin-login-form',
    submitId: 'btn-admin-login',
    submitLabel: 'Entrar',
    fields: [
      { id: 'email', name: 'email', label: 'E-mail', type: 'email', placeholder: 'Email', required: true },
      { id: 'password', name: 'password', label: 'Senha', type: 'password', placeholder: 'Sua senha', required: true }
    ]
  });

  const errorBox = createAuthErrorBox('Credenciais inválidas');

  renderAuthPage({
    navLinks: [
      { href: `${basePath}/`, label: 'Explorar', className: 'nav-link' },
      { href: `${basePath}/login`, label: 'Login Cliente', className: 'nav-button' }
    ],
    title: 'Setor Administrativo',
    subtitle: 'Acesso restrito para gestão da barbearia.',
    bodyNodes: [form, errorBox],
    footerNote: '© 2026 AlphaCuts. Tradição e Tecnologia.'
  });
})();
