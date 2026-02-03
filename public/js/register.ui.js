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
      { id: 'password', name: 'password', label: 'Senha', type: 'password', placeholder: 'Mínimo 6 caracteres', required: true },
      { id: 'confirm_password', name: 'confirm_password', label: 'Confirmar Senha', type: 'password', placeholder: 'Confirme sua senha', required: true }
    ]
  });

  // Inject Password Requirements List
  const confirmPasswordField = form.querySelector('#confirm_password').closest('.form-group');
  const reqList = document.createElement('ul');
  reqList.id = 'password-requirements';
  reqList.className = 'requirements-list hidden';
  reqList.innerHTML = `
    <li id="req-capital" class="req-item"><span class="material-icons">check_circle</span> Uma letra maiúscula</li>
    <li id="req-number" class="req-item"><span class="material-icons">check_circle</span> Um número</li>
    <li id="req-symbol" class="req-item"><span class="material-icons">check_circle</span> Um símbolo (!@#$%^&*)</li>
    <li id="req-length" class="req-item"><span class="material-icons">check_circle</span> Mínimo 6 caracteres</li>
    <li id="req-match" class="req-item"><span class="material-icons">check_circle</span> Senhas coincidem</li>
  `;
  confirmPasswordField.appendChild(reqList);

  const errorBox = createAuthErrorBox('Erro ao cadastrar');
  const footer = createAuthFooter({
    text: 'Já tem uma conta?',
    linkText: 'Faça Login',
    href: `${basePath}/login`
  });

  renderAuthPage({
    navLinks: [{ href: `${basePath}/`, label: 'Voltar ao Início', className: 'nav-link' }],
    title: 'Criar Conta',
    subtitle: 'Junte-se a nossa família!',
    bodyNodes: [form, errorBox, footer],
    footerNote: '© 2026 AlphaCuts. Petrolina/PE.'
  });
})();
