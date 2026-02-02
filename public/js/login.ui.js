(function () {
  const basePath = window.BASE_PATH || '';
  const { renderAuthPage } = window.LAYOUT || {};
  const { createAuthForm, createAuthErrorBox, createAuthFooter } = window.FORMS || {};

  if (!renderAuthPage || !createAuthForm || !createAuthErrorBox || !createAuthFooter) return;

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
})();
