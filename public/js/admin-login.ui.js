(function () {
  const basePath = window.BASE_PATH || '';
  const { renderAuthPage } = window.LAYOUT || {};
  const { createInput, createFormGroup } = window.UI || {};

  if (!renderAuthPage || !createInput || !createFormGroup) return;

  const form = document.createElement('form');
  form.id = 'admin-login-form';
  form.className = 'auth-form';

  const email = createInput({ type: 'email', placeholder: 'Email' });
  email.id = 'email';
  email.required = true;
  form.appendChild(createFormGroup('E-mail', email));

  const password = createInput({ type: 'password', placeholder: 'Sua senha' });
  password.id = 'password';
  password.required = true;
  form.appendChild(createFormGroup('Senha', password));

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.id = 'btn-admin-login';
  submit.className = 'primary-button auth-submit';
  submit.textContent = 'Entrar';
  form.appendChild(submit);

  const errorBox = document.createElement('div');
  errorBox.id = 'error-container';
  errorBox.className = 'auth-error-box hidden';
  const errorMsg = document.createElement('span');
  errorMsg.id = 'error-msg';
  errorMsg.textContent = 'Credenciais inválidas';
  errorBox.appendChild(errorMsg);

  renderAuthPage({
    navLinks: [
      { href: `${basePath}/`, label: 'Explorar', className: 'nav-link' },
      { href: `${basePath}/login`, label: 'Login Cliente', className: 'nav-button' }
    ],
    title: 'Setor Administrativo',
    subtitle: 'Acesso restrito para gestão da barbearia.',
    bodyNodes: [form, errorBox],
    footerNote: '© 2026 BarberMarket. Tradição e Tecnologia.'
  });
})();
