(() => {
  const ui = window.UI || {};
  const createInput = ui.createInput;
  const createFormGroup = ui.createFormGroup;

  const createAuthForm = ({ id, className = 'auth-form', submitLabel, submitId, fields = [] } = {}) => {
    const form = document.createElement('form');
    if (id) form.id = id;
    form.className = className;

    const inputs = {};

    fields.forEach((field) => {
      if (!field) return;
      const input = createInput({
        type: field.type || 'text',
        placeholder: field.placeholder,
        value: field.value,
        min: field.min,
        max: field.max,
        step: field.step
      });
      if (field.id) input.id = field.id;
      if (field.required) input.required = true;
      inputs[field.name || field.id || field.label] = input;
      form.appendChild(createFormGroup(field.label || ' ', input));
    });

    const submit = document.createElement('button');
    submit.type = 'submit';
    if (submitId) submit.id = submitId;
    submit.className = 'primary-button auth-submit';
    submit.textContent = submitLabel || 'Enviar';
    form.appendChild(submit);

    return { form, inputs, submit };
  };

  const createAuthErrorBox = (message, { id = 'error-container', messageId = 'error-msg' } = {}) => {
    const errorBox = document.createElement('div');
    errorBox.id = id;
    errorBox.className = 'auth-error-box hidden';
    const errorMsg = document.createElement('span');
    errorMsg.id = messageId;
    errorMsg.textContent = message || 'Erro';
    errorBox.appendChild(errorMsg);
    return errorBox;
  };

  const createAuthFooter = ({ text, linkText, href, className = 'auth-footer' } = {}) => {
    const footer = document.createElement('div');
    footer.className = className;
    if (text) {
      const span = document.createElement('span');
      span.textContent = text;
      footer.appendChild(span);
    }
    if (linkText && href) {
      const link = document.createElement('a');
      link.className = 'auth-link';
      link.href = href;
      link.textContent = linkText;
      footer.appendChild(link);
    }
    return footer;
  };

  window.FORMS = {
    createAuthForm,
    createAuthErrorBox,
    createAuthFooter
  };
})();
