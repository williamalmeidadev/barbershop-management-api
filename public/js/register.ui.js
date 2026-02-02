(function () {
  const basePath = window.BASE_PATH || '';
  const { renderAuthPage } = window.LAYOUT || {};
  const { createInput, createFormGroup } = window.UI || {};

  if (!renderAuthPage || !createInput || !createFormGroup) return;

  const form = document.createElement('form');
  form.id = 'register-form';
  form.className = 'auth-form';

  const nome = createInput({ type: 'text', placeholder: 'Como podemos te chamar?' });
  nome.id = 'nome';
  nome.required = true;
  form.appendChild(createFormGroup('Nome Completo', nome));

  const email = createInput({ type: 'email', placeholder: 'Email' });
  email.id = 'email';
  email.required = true;
  form.appendChild(createFormGroup('E-mail', email));

  const telefone = createInput({ type: 'tel', placeholder: '(87) 9 9999-9999' });
  telefone.id = 'telefone';
  form.appendChild(createFormGroup('Telefone (opcional)', telefone));

  const password = createInput({ type: 'password', placeholder: 'Mínimo 6 caracteres' });
  password.id = 'password';
  password.required = true;
  form.appendChild(createFormGroup('Senha', password));

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.id = 'btn-register';
  submit.className = 'primary-button auth-submit';
  submit.textContent = 'Cadastrar Agora';
  form.appendChild(submit);

  const errorBox = document.createElement('div');
  errorBox.id = 'error-container';
  errorBox.className = 'auth-error-box hidden';
  const errorMsg = document.createElement('span');
  errorMsg.id = 'error-msg';
  errorMsg.textContent = 'Erro ao cadastrar';
  errorBox.appendChild(errorMsg);

  const footer = document.createElement('div');
  footer.className = 'auth-footer';
  const footerText = document.createElement('span');
  footerText.textContent = 'Já tem uma conta?';
  const footerLink = document.createElement('a');
  footerLink.className = 'auth-link';
  footerLink.href = `${basePath}/login`;
  footerLink.textContent = 'Faça Login';
  footer.appendChild(footerText);
  footer.appendChild(footerLink);

  renderAuthPage({
    navLinks: [{ href: `${basePath}/`, label: 'Voltar ao Início', className: 'nav-link' }],
    title: 'Criar Conta',
    subtitle: 'Junte-se ao marketplace de barbearias.',
    bodyNodes: [form, errorBox, footer],
    footerNote: '© 2026 BarberMarket. Petrolina/PE.'
  });
})();
