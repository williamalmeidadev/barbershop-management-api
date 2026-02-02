(function () {
  const layout = window.LAYOUT || {};
  const { createEl, appendChildren } = layout;

  if (!createEl || !appendChildren) return;

  const root = document.getElementById('app');
  if (!root) return;
  root.replaceChildren();

  const adminLayout = createEl('div', { className: 'admin-layout' });

  const sidebar = createEl('aside', { className: 'sidebar' });
  const sidebarHeader = createEl('div', { className: 'sidebar-header' });
  sidebarHeader.appendChild(createEl('span', { className: 'material-icons', text: 'diversity_3' }));
  sidebarHeader.appendChild(createEl('h1', { text: 'Admin' }));

  const nav = createEl('nav', { className: 'sidebar-nav' });
  const navItems = [
    { tab: 'config', icon: 'tune', label: 'Configurações', active: true },
    { tab: 'clientes', icon: 'people', label: 'Clientes' },
    { tab: 'agendamentos', icon: 'calendar_month', label: 'Agendamentos' },
    { tab: 'vagas', icon: 'event_available', label: 'Vagas' },
    { tab: 'servicos', icon: 'content_cut', label: 'Serviços' },
    { tab: 'barbeiros', icon: 'face', label: 'Barbeiros' }
  ];
  navItems.forEach((item) => {
    const btn = createEl('button', {
      className: `nav-item${item.active ? ' active' : ''}`,
      attrs: { 'data-tab': item.tab }
    });
    btn.appendChild(createEl('span', { className: 'material-icons', text: item.icon }));
    btn.appendChild(document.createTextNode(` ${item.label}`));
    nav.appendChild(btn);
  });

  const sidebarFooter = createEl('div', { className: 'sidebar-footer' });
  const logoutBtn = createEl('button', {
    className: 'btn ghost-danger',
    attrs: { id: 'logout-btn' }
  });
  logoutBtn.appendChild(createEl('span', { className: 'material-icons', text: 'logout' }));
  logoutBtn.appendChild(document.createTextNode(' Sair'));
  sidebarFooter.appendChild(logoutBtn);

  appendChildren(sidebar, [sidebarHeader, nav, sidebarFooter]);

  const main = createEl('main', { className: 'content' });
  const topbar = createEl('header', { className: 'topbar' });
  topbar.appendChild(createEl('div'));
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
