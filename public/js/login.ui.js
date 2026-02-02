(function () {
  const basePath = window.BASE_PATH || '';
  const { renderAuthPage } = window.LAYOUT || {};
  const { createInput, createFormGroup } = window.UI || {};

  if (!renderAuthPage || !createInput || !createFormGroup) return;

  const form = document.createElement('form');
  form.id = 'login-form';
  form.className = 'auth-form';

  const email = createInput({ type: 'email', placeholder: 'Email' });
  email.id = 'email';
  email.required = true;
  form.appendChild(createFormGroup('E-mail', email));

  const password = createInput({ type: 'password', placeholder: 'Sua senha secreta' });
  password.id = 'password';
  password.required = true;
  form.appendChild(createFormGroup('Senha', password));

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.id = 'btn-login';
  submit.className = 'primary-button auth-submit';
  submit.textContent = 'Acessar Conta';
  form.appendChild(submit);

  const errorBox = document.createElement('div');
  errorBox.id = 'error-container';
  errorBox.className = 'auth-error-box hidden';
  const errorMsg = document.createElement('span');
  errorMsg.id = 'error-msg';
  errorMsg.textContent = 'Credenciais inválidas';
  errorBox.appendChild(errorMsg);

  const footer = document.createElement('div');
  footer.className = 'auth-footer';
  const footerText = document.createElement('span');
  footerText.textContent = 'Ainda não tem conta?';
  const footerLink = document.createElement('a');
  footerLink.className = 'auth-link';
  footerLink.href = `${basePath}/register`;
  footerLink.textContent = 'Criar conta grátis';
  footer.appendChild(footerText);
  footer.appendChild(footerLink);

  const adminLink = document.createElement('a');
  adminLink.className = 'auth-admin-link';
  adminLink.href = `${basePath}/admin-login`;
  adminLink.textContent = 'Acesso Administrativo';

  renderAuthPage({
    navLinks: [{ href: `${basePath}/`, label: 'Voltar ao Início', className: 'nav-link' }],
    title: 'Bem-vindo',
    subtitle: 'Acesse sua conta para continuar',
    bodyNodes: [form, errorBox, footer, adminLink],
    footerNote: '© 2026 BarberMarket. Todos os direitos reservados.'
  });
})();
