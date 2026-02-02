(function () {
  const ui = window.UI || {};
  const createInput = ui.createInput;
  const createSelect = ui.createSelect;
  const createFormGroup = ui.createFormGroup;

  if (!createInput || !createSelect || !createFormGroup) return;

  const createFilterForm = ({ className = 'form-grid filters', fields = [], onSubmit } = {}) => {
    const form = document.createElement('form');
    form.className = className;
    const elements = {};

    fields.forEach((field) => {
      let inputEl;
      if (field.type === 'select') {
        inputEl = createSelect({ options: field.options || [], value: field.value, className: field.className });
      } else if (field.type === 'button') {
        inputEl = document.createElement('button');
        inputEl.type = 'submit';
        inputEl.className = field.className || 'btn';
        inputEl.textContent = field.text || field.label || 'Pesquisar';
      } else {
        inputEl = createInput({
          type: field.type || 'text',
          placeholder: field.placeholder,
          value: field.value,
          className: field.className
        });
      }
      if (field.id) inputEl.id = field.id;
      if (field.required) inputEl.required = true;
      const label = field.label || '';
      const group = createFormGroup(label || ' ', inputEl);
      if (field.labelEmpty) group.querySelector('label').textContent = ' ';
      if (field.groupClass) group.classList.add(field.groupClass);
      form.appendChild(group);
      if (field.id) elements[field.id] = inputEl;
    });

    if (onSubmit) {
      form.addEventListener('submit', onSubmit);
    }
    return { form, elements };
  };

  window.FILTERS = {
    createFilterForm
  };
})();
