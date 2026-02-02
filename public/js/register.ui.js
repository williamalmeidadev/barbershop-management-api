(function () {
  const basePath = window.BASE_PATH || '';
  const { renderAuthPage } = window.LAYOUT || {};
  const { createAuthForm, createAuthErrorBox, createAuthFooter } = window.FORMS || {};

  if (!renderAuthPage || !createAuthForm || !createAuthErrorBox || !createAuthFooter) return;

  const { form } = createAuthForm({
    id: 'register-form',
    submitId: 'btn-register',
    submitLabel: 'Cadastrar Agora',
    fields: [
      { id: 'nome', name: 'nome', label: 'Nome Completo', type: 'text', placeholder: 'Como podemos te chamar?', required: true },
      { id: 'email', name: 'email', label: 'E-mail', type: 'email', placeholder: 'Email', required: true },
      { id: 'telefone', name: 'telefone', label: 'Telefone (opcional)', type: 'tel', placeholder: '(87) 9 9999-9999' },
      { id: 'password', name: 'password', label: 'Senha', type: 'password', placeholder: 'Mínimo 6 caracteres', required: true }
    ]
  });

  const errorBox = createAuthErrorBox('Erro ao cadastrar');
  const footer = createAuthFooter({
    text: 'Já tem uma conta?',
    linkText: 'Faça Login',
    href: `${basePath}/login`
  });

  renderAuthPage({
    navLinks: [{ href: `${basePath}/`, label: 'Voltar ao Início', className: 'nav-link' }],
    title: 'Criar Conta',
    subtitle: 'Junte-se ao marketplace de barbearias.',
    bodyNodes: [form, errorBox, footer],
    footerNote: '© 2026 AlphaCuts. Petrolina/PE.'
  });
})();
