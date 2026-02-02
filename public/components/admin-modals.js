(function () {
  const ui = window.UI || {};
  const el = ui.el || ((tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  });
  const createButton = ui.createButton;

  if (!createButton) return;

  const createModalForm = ({
    containerClass = '',
    gridClass = 'form-grid',
    actionLabel = 'Salvar',
    actionClass = 'btn primary',
    actionAlign = 'center'
  } = {}) => {
    const container = el('div');
    if (containerClass) container.classList.add(...containerClass.split(' '));
    const grid = el('div', gridClass);
    const actions = el('div', `modal-actions ${actionAlign}`.trim());
    const primaryBtn = createButton(actionLabel, actionClass);
    actions.appendChild(primaryBtn);
    container.appendChild(grid);
    container.appendChild(actions);
    return { container, grid, actions, primaryBtn };
  };

  window.ADMIN_MODALS = {
    createModalForm
  };
})();
