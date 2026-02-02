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

  const createModalGrid = ({ gridClass = 'form-grid', containerClass = '' } = {}) => {
    const container = el('div');
    if (containerClass) container.classList.add(...containerClass.split(' '));
    const grid = el('div', gridClass);
    container.appendChild(grid);
    return { container, grid };
  };

  const createDetailsLayout = ({ leftTitle = 'Itens', rightTitle = 'Detalhes' } = {}) => {
    const container = el('div');
    const grid = el('div', 'details-grid');
    const columns = el('div', 'details-columns');

    const leftBox = el('div', 'details-box');
    leftBox.appendChild(el('strong', null, leftTitle));
    const leftList = el('ul');
    leftBox.appendChild(leftList);

    const rightBox = el('div', 'details-box');
    rightBox.appendChild(el('strong', null, rightTitle));
    const rightList = el('ul');
    rightBox.appendChild(rightList);

    columns.appendChild(leftBox);
    columns.appendChild(rightBox);
    container.appendChild(grid);
    container.appendChild(columns);

    return { container, grid, columns, leftBox, rightBox, leftList, rightList };
  };

  window.ADMIN_MODALS = {
    createModalForm,
    createModalGrid,
    createDetailsLayout
  };
})();
