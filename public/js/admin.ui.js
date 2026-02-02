(function () {
  const layout = window.LAYOUT || {};
  const { createEl, appendChildren } = layout;

  if (!createEl || !appendChildren) return;

  const root = document.getElementById('app');
  if (!root) return;
  root.replaceChildren();

  const adminLayout = createEl('div', { className: 'admin-layout' });
  const sidebar = layout.createAdminSidebar
    ? layout.createAdminSidebar({ onLogoutId: 'logout-btn' })
    : createEl('aside', { className: 'sidebar' });
  const topbar = layout.createAdminTopbar ? layout.createAdminTopbar() : createEl('header', { className: 'topbar' });
  if (!layout.createAdminTopbar) topbar.appendChild(createEl('div'));
  const main = createEl('main', { className: 'content' });
  main.appendChild(topbar);

  const buildPanel = (id, headerId, listId, extra = []) => {
    const section = createEl('section', { className: `tab-panel${id === 'config' ? '' : ' hidden'}`, attrs: { id: `tab-${id}` } });
    const panel = createEl('div', { className: 'panel' });
    const panelHeader = createEl('div', { className: 'panel-header', attrs: { id: headerId } });
    panel.appendChild(panelHeader);
    extra.forEach((node) => node && panel.appendChild(node));
    if (listId) panel.appendChild(createEl('div', { className: 'cards-grid', attrs: { id: listId } }));
    section.appendChild(panel);
    return section;
  };

  const configPanel = buildPanel('config', 'panel-header-config', null, [
    createEl('div', { className: 'config-grid', attrs: { id: 'config-card-container' } })
  ]);

  const clientesPanel = buildPanel('clientes', 'panel-header-clientes', 'clientes-list', [
    createEl('div', { attrs: { id: 'clientes-filters' } })
  ]);

  const agendamentosPanel = buildPanel('agendamentos', 'panel-header-agendamentos', 'agendamentos-list', [
    createEl('div', { attrs: { id: 'agendamentos-filters' } })
  ]);

  const vagasSection = createEl('section', { className: 'tab-panel hidden', attrs: { id: 'tab-vagas' } });
  const vagasPanel = createEl('div', { className: 'panel' });
  vagasPanel.appendChild(createEl('div', { className: 'panel-header', attrs: { id: 'panel-header-vagas' } }));
  const vagasForm = createEl('form', { className: 'form-grid filters bg-soft', attrs: { id: 'form-vagas' } });
  const fg1 = createEl('div', { className: 'form-group' });
  fg1.appendChild(createEl('label', { text: 'Barbeiro' }));
  fg1.appendChild(createEl('select', { className: 'barbeiro-select', attrs: { id: 'vagas-barbeiro', required: 'true' } }));
  const fg2 = createEl('div', { className: 'form-group' });
  fg2.appendChild(createEl('label', { text: 'Data' }));
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'vagas-data';
  dateInput.required = true;
  fg2.appendChild(dateInput);
  const fg3 = createEl('div', { className: 'form-group align-end' });
  const submitBtn = createEl('button', { className: 'btn full-width', text: 'Buscar' });
  fg3.appendChild(submitBtn);
  appendChildren(vagasForm, [fg1, fg2, fg3]);
  vagasPanel.appendChild(vagasForm);
  const vagasList = createEl('div', { className: 'cards-grid compact', attrs: { id: 'vagas-list' } });
  vagasPanel.appendChild(vagasList);
  vagasSection.appendChild(vagasPanel);

  const servicosPanel = buildPanel('servicos', 'panel-header-servicos', 'servicos-list');
  const barbeirosPanel = buildPanel('barbeiros', 'panel-header-barbeiros', 'barbeiros-list');

  appendChildren(main, [configPanel, clientesPanel, agendamentosPanel, vagasSection, servicosPanel, barbeirosPanel]);

  adminLayout.appendChild(sidebar);
  adminLayout.appendChild(main);
  root.appendChild(adminLayout);

  const modal = createEl('div', { className: 'modal hidden', attrs: { id: 'modal' } });
  const modalContent = createEl('div', { className: 'modal-content' });
  const modalHeader = createEl('div', { className: 'modal-header' });
  modalHeader.appendChild(createEl('h3', { attrs: { id: 'modal-title' }, text: 'Título' }));
  const modalClose = createEl('button', { className: 'btn-icon', attrs: { id: 'modal-close' } });
  modalClose.appendChild(createEl('span', { className: 'material-icons', text: 'close' }));
  modalHeader.appendChild(modalClose);
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(createEl('div', { attrs: { id: 'modal-body' } }));
  modal.appendChild(modalContent);
  root.appendChild(modal);

  root.appendChild(createEl('div', { className: 'toast-container', attrs: { id: 'toast-container' } }));
})();
