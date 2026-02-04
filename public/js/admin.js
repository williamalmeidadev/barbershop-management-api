const apiBase = window.BASE_PATH || '';

function getCookie(name) {
  return document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.split('=')[1];
}

const adminTokenCookie = getCookie('admin_token');
if (!adminTokenCookie) {
  window.location.replace(`${apiBase}/admin-login`);
}
const logoutBtn = document.getElementById('logout-btn');

const navItems = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.tab-panel');

const configContainer = document.getElementById('config-card-container');
let btnConfigCreate = null;

let loadClientesBtn = null;
let buscarClientesBtn = null;
let clientesAtivo = null;
let clientesBusca = null;
const clientesList = document.getElementById('clientes-list');

let loadAgendamentosBtn = null;
let buscarAgendamentosBtn = null;
let agendamentosStatus = null;
let agendamentosBusca = null;
let agendamentosBarbeiro = null;
let agendamentosData = null;
const agendamentosList = document.getElementById('agendamentos-list');

const formVagas = document.getElementById('form-vagas');
const vagasList = document.getElementById('vagas-list');
let btnAbrirGerar = null;
let btnAbrirBloqueio = null;
let btnAbrirReserva = null;

let loadServicosBtn = null;
const servicosList = document.getElementById('servicos-list');
let btnNovoServico = null;

let loadBarbeirosBtn = null;
const barbeirosList = document.getElementById('barbeiros-list');
let btnNovoBarbeiro = null;

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const toastContainer = document.getElementById('toast-container');

let cachedBarbeiros = [];

function qs(id) {
  return document.getElementById(id);
}

const ui = window.UI || {};
const adminModals = window.ADMIN_MODALS || {};
const el = ui.el;
const clear = ui.clear;
const createCard = ui.createCard;
const createButton = ui.createButton;
const createIcon = ui.createIcon;
const createMedia = ui.createMedia;
const createActionsRow = ui.createActionsRow;
const createActionButton = ui.createActionButton;
const createCardWithLines = ui.createCardWithLines;
const createInfoRow = ui.createInfoRow;
const createInput = adminModals.createInput || ui.createInput;
const createSelect = adminModals.createSelect || ui.createSelect;
const createFormGroup = ui.createFormGroup;
const createPhotoGroup = ui.createPhotoGroup;
const renderStatus = ui.renderStatus;
const renderCardList = ui.renderCardList;

const layout = window.LAYOUT || {};
const createPanelHeader = layout.createPanelHeader;
const renderPanelHeader = layout.renderPanelHeader;
const adminCards = window.ADMIN_CARDS || {};
const filters = window.FILTERS || {};
const topbar = document.querySelector('.topbar');
if (layout.renderAdminPanelHeader && topbar) {
  let actions = null;
  if (layout.createThemeToggle && layout.createEl) {
    const themeBtn = layout.createThemeToggle();
    const actionsWrap = layout.createEl('div', { className: 'topbar-actions' });
    actionsWrap.appendChild(themeBtn);
    actions = actionsWrap;
  }

  layout.renderAdminPanelHeader(topbar, {
    title: 'Dashboard',
    subtitle: 'Visão geral do sistema',
    actions
  });
}

function initPanelHeaders() {
  if (!createPanelHeader || !renderPanelHeader) return;

  renderPanelHeader(document.getElementById('panel-header-config'), {
    title: 'Regras de Desconto',
    actions: [
      createActionButton({
        id: 'btn-config-create',
        label: 'Nova Regra',
        className: 'btn primary',
        icon: 'add'
      })
    ]
  });

  renderPanelHeader(document.getElementById('panel-header-clientes'), {
    title: 'Clientes',
    actions: [
      createActionButton({
        id: 'load-clientes',
        label: 'Atualizar',
        className: 'btn ghost'
      })
    ]
  });

  renderPanelHeader(document.getElementById('panel-header-agendamentos'), {
    title: 'Agendamentos',
    actions: [
      createActionButton({
        id: 'load-agendamentos',
        label: 'Atualizar',
        className: 'btn ghost'
      })
    ]
  });

  renderPanelHeader(document.getElementById('panel-header-vagas'), {
    title: 'Gerenciar Agenda',
    actions: [
      createActionButton({
        id: 'btn-abrir-gerar-vagas',
        label: 'Gerar Vagas',
        className: 'btn primary'
      }),
      createActionButton({
        id: 'btn-abrir-bloqueio',
        label: 'Bloquear',
        className: 'btn ghost'
      }),
      createActionButton({
        id: 'btn-abrir-reserva',
        label: 'Reservar',
        className: 'btn ghost'
      })
    ]
  });

  renderPanelHeader(document.getElementById('panel-header-servicos'), {
    title: 'Catálogo de Serviços',
    actions: [
      createActionButton({
        id: 'load-servicos',
        label: 'Atualizar',
        className: 'btn ghost'
      }),
      createActionButton({
        id: 'btn-novo-servico',
        label: 'Novo Serviço',
        className: 'btn primary'
      })
    ]
  });

  renderPanelHeader(document.getElementById('panel-header-barbeiros'), {
    title: 'Equipe',
    actions: [
      createActionButton({
        id: 'load-barbeiros',
        label: 'Atualizar',
        className: 'btn ghost'
      }),
      createActionButton({
        id: 'btn-novo-barbeiro',
        label: 'Novo Barbeiro',
        className: 'btn primary'
      })
    ]
  });

  btnConfigCreate = document.getElementById('btn-config-create');
  loadClientesBtn = document.getElementById('load-clientes');
  loadAgendamentosBtn = document.getElementById('load-agendamentos');
  btnAbrirGerar = document.getElementById('btn-abrir-gerar-vagas');
  btnAbrirBloqueio = document.getElementById('btn-abrir-bloqueio');
  btnAbrirReserva = document.getElementById('btn-abrir-reserva');
  loadServicosBtn = document.getElementById('load-servicos');
  btnNovoServico = document.getElementById('btn-novo-servico');
  loadBarbeirosBtn = document.getElementById('load-barbeiros');
  btnNovoBarbeiro = document.getElementById('btn-novo-barbeiro');
}

initPanelHeaders();

function initFilters() {
  if (!filters.createFilterForm) return;

  const clientesFilters = filters.createFilterForm({
    fields: [
      {
        label: 'Status',
        type: 'select',
        id: 'clientes-ativo',
        options: [
          { value: '', label: 'Todos' },
          { value: '1', label: 'Ativos' },
          { value: '0', label: 'Inativos' }
        ]
      },
      {
        label: 'Buscar',
        type: 'text',
        id: 'clientes-busca',
        placeholder: 'Nome ou e-mail'
      },
      {
        labelEmpty: true,
        type: 'button',
        id: 'buscar-clientes',
        placeholder: '',
        groupClass: 'align-end',
        className: 'btn'
      }
    ],
    onSubmit: (e) => {
      e.preventDefault();
      const btn = e.submitter || buscarClientesBtn || loadClientesBtn;
      withButtonLock(btn, fetchClientes);
    }
  });

  const clientesFiltersWrap = document.getElementById('clientes-filters');
  if (clientesFiltersWrap) {
    clientesFiltersWrap.replaceChildren(clientesFilters.form);
  }

  const agendamentosFilters = filters.createFilterForm({
    fields: [
      {
        label: 'Status',
        type: 'select',
        id: 'agendamentos-status',
        options: [
          { value: '', label: 'Todos' },
          { value: 'SOLICITADO', label: 'Solicitado' },
          { value: 'AGENDADO', label: 'Agendado' },
          { value: 'CONCLUIDO', label: 'Concluído' },
          { value: 'CANCELADO', label: 'Cancelado' },
          { value: 'RECUSADO', label: 'Recusado' }
        ]
      },
      {
        label: 'Cliente',
        type: 'text',
        id: 'agendamentos-busca',
        placeholder: 'Nome do cliente'
      },
      {
        label: 'Barbeiro',
        type: 'select',
        id: 'agendamentos-barbeiro',
        className: 'barbeiro-select',
        options: [{ value: '', label: 'Todos' }]
      },
      {
        label: 'Data',
        type: 'date',
        id: 'agendamentos-data'
      },
      {
        labelEmpty: true,
        type: 'button',
        id: 'buscar-agendamentos',
        groupClass: 'align-end',
        className: 'btn'
      }
    ],
    onSubmit: (e) => {
      e.preventDefault();
      const btn = e.submitter || buscarAgendamentosBtn || loadAgendamentosBtn;
      withButtonLock(btn, fetchAgendamentos);
    }
  });

  const agendamentosFiltersWrap = document.getElementById('agendamentos-filters');
  if (agendamentosFiltersWrap) {
    agendamentosFiltersWrap.replaceChildren(agendamentosFilters.form);
  }

  buscarClientesBtn = document.getElementById('buscar-clientes');
  clientesAtivo = document.getElementById('clientes-ativo');
  clientesBusca = document.getElementById('clientes-busca');
  buscarAgendamentosBtn = document.getElementById('buscar-agendamentos');
  agendamentosStatus = document.getElementById('agendamentos-status');
  agendamentosBusca = document.getElementById('agendamentos-busca');
  agendamentosBarbeiro = document.getElementById('agendamentos-barbeiro');
  agendamentosData = document.getElementById('agendamentos-data');
}

initFilters();

function api(path) {
  return `${apiBase}${path}`;
}

const formatCurrency = ui.formatCurrency;
const APP_TIMEZONE = 'America/Sao_Paulo';
const dateFormatterBR = new Intl.DateTimeFormat('pt-BR', { timeZone: APP_TIMEZONE });
const timeFormatterBR = new Intl.DateTimeFormat('pt-BR', {
  timeZone: APP_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});
const dateFormatterISO = new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE });
function formatDateBR(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return dateFormatterBR.format(date);
}
function formatDateISO(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return dateFormatterISO.format(date);
}
function formatDateTimeBR(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return `${dateFormatterBR.format(date)} ${timeFormatterBR.format(date)}`;
}

function toIsoWithOffset(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute, second = 0] = timeStr.split(':').map(Number);
  const local = new Date(year, month - 1, day, hour, minute, second);
  const offsetMin = local.getTimezoneOffset();
  const sign = offsetMin <= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const offH = String(Math.floor(abs / 60)).padStart(2, '0');
  const offM = String(abs % 60).padStart(2, '0');
  const yyyy = local.getFullYear();
  const mm = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  const hh = String(local.getHours()).padStart(2, '0');
  const min = String(local.getMinutes()).padStart(2, '0');
  const sec = String(local.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${sec}${sign}${offH}:${offM}`;
}

async function request(path, options = {}) {
  if (window.API?.json) return window.API.json(path, options);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(api(path), { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    throw new Error(data?.error || data || 'Erro ao requisitar');
  }
  return data;
}

async function requestFormData(path, formData) {
  if (window.API?.form) return window.API.form(path, formData, { method: 'PATCH' });
  const res = await fetch(api(path), { method: 'PATCH', body: formData });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    throw new Error(data?.error || data || 'Erro ao requisitar');
  }
  return data;
}

function withButtonLock(button, fn) {
  if (!button) return fn();
  if (button.disabled) return;
  button.disabled = true;
  return Promise.resolve(fn()).finally(() => {
    button.disabled = false;
  });
}

function switchTab(tab) {
  navItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tab));
  panels.forEach(panel => panel.classList.toggle('hidden', panel.id !== `tab-${tab}`));

  if (tab === 'clientes') loadClientesBtn.click();
  if (tab === 'servicos') loadServicosBtn.click();
  if (tab === 'barbeiros') loadBarbeirosBtn.click();
  if (tab === 'agendamentos') loadAgendamentosBtn.click();
  if (tab === 'vagas') loadBarbeirosCache();
}

const showToast = (message, type = 'success') => {
  if (ui.toast) return ui.toast(toastContainer, message, { type, classBase: 'toast' });
  const toast = el('div', `toast ${type}`);
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
};

function validateImageFile(file) {
  const maxSize = 2 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Formato inválido. Use JPG, PNG ou WEBP.';
  }
  if (file.size > maxSize) {
    return 'Arquivo muito grande. Limite de 2MB.';
  }
  return null;
}

const modalApi = ui.createModalController
  ? ui.createModalController({ modal, titleEl: modalTitle, bodyEl: modalBody, closeEl: modalClose })
  : null;

function openModal(title, contentNode) {
  if (modalApi) return modalApi.open(title, contentNode);
  modalTitle.textContent = title;
  clear(modalBody);
  modalBody.appendChild(contentNode);
  modal.classList.remove('hidden');
}

function closeModal() {
  if (modalApi) return modalApi.close();
  modal.classList.add('hidden');
  clear(modalBody);
}

function askDeleteConfirmation({ title = 'Confirmar exclusão', message = 'Esta ação não pode ser desfeita.' } = {}) {
  return new Promise((resolve) => {
    const container = el('div', 'modal-form');
    const text = el('p', null, message);
    const actions = el('div', 'modal-actions center');
    const cancelBtn = createButton('Cancelar', 'btn ghost');
    const confirmBtn = createButton('Apagar', 'btn danger');

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    container.appendChild(text);
    container.appendChild(actions);

    const onCancel = () => {
      closeModal();
      resolve(false);
    };
    const onConfirm = () => {
      closeModal();
      resolve(true);
    };

    cancelBtn.addEventListener('click', onCancel, { once: true });
    confirmBtn.addEventListener('click', onConfirm, { once: true });

    openModal(title, container);
  });
}

navItems.forEach(item => {
  item.addEventListener('click', () => switchTab(item.dataset.tab));
});

logoutBtn.addEventListener('click', () => {
  document.cookie = 'admin_token=; Max-Age=0; path=/; SameSite=Lax';
  showToast('Logout realizado.');
  setTimeout(() => {
    window.location.href = `${apiBase}/admin-login`;
  }, 300);
});

function populateBarbeiroSelect(select, selectedId) {
  clear(select);
  const opt = el('option', null, 'Selecione');
  opt.value = '';
  select.appendChild(opt);
  cachedBarbeiros.forEach(b => {
    const option = el('option', null, b.nome_profissional);
    option.value = String(b.id);
    if (Number(selectedId) === Number(b.id)) option.selected = true;
    select.appendChild(option);
  });
}

function getBarbeiroNomeById(id) {
  const found = cachedBarbeiros.find(b => Number(b.id) === Number(id));
  return found?.nome_profissional || (id ? `#${id}` : '—');
}

function populateBarbeiroSelects() {
  document.querySelectorAll('.barbeiro-select').forEach(select => {
    const selected = select.getAttribute('data-selected');
    populateBarbeiroSelect(select, selected);
  });
}

async function loadBarbeirosCache() {
  try {
    const data = await request('/barbeiros');
    cachedBarbeiros = data || [];
    populateBarbeiroSelects();
  } catch {
    cachedBarbeiros = [];
  }
}

async function loadConfig() {
  try {
    const data = await request('/configuracoes/descontos');
    renderConfigCard(data);
  } catch (err) {
    renderConfigCard(null, err.message);
  }
}

function renderConfigCard(data, error) {
  clear(configContainer);

  if (error) {
    const card = adminCards.createConfigCard
      ? adminCards.createConfigCard({ title: 'Erro', message: error, icon: 'error' })
      : (() => {
        const c = el('div', 'config-card');
        const icon = el('span', 'material-icons', 'error');
        const wrap = el('div');
        wrap.appendChild(el('h4', null, 'Erro'));
        wrap.appendChild(el('p', 'output', error));
        c.appendChild(icon);
        c.appendChild(wrap);
        return c;
      })();
    configContainer.appendChild(card);
    return;
  }

  const hasRule = data && data.desconto_qtd_concluidos && data.desconto_valor_centavos;
  if (!hasRule) {
    const card = adminCards.createConfigCard
      ? adminCards.createConfigCard({
        title: 'Sem regra ativa',
        message: 'Crie uma regra de desconto para começar.',
        icon: 'info'
      })
      : (() => {
        const c = el('div', 'config-card');
        const icon = el('span', 'material-icons', 'info');
        const wrap = el('div');
        wrap.appendChild(el('h4', null, 'Sem regra ativa'));
        wrap.appendChild(el('p', 'output', 'Crie uma regra de desconto para começar.'));
        c.appendChild(icon);
        c.appendChild(wrap);
        return c;
      })();
    configContainer.appendChild(card);
    return;
  }

  const editBtn = el('button', 'btn ghost', 'Editar');
  const removeBtn = el('button', 'btn danger', 'Remover');
  const message = `${data.desconto_qtd_concluidos} concluídos → ${formatCurrency(data.desconto_valor_centavos)} de desconto`;
  const card = adminCards.createConfigCard
    ? adminCards.createConfigCard({
      title: 'Regra Atual',
      message,
      icon: 'verified',
      actions: [editBtn, removeBtn]
    })
    : (() => {
      const c = el('div', 'config-card');
      const icon = el('span', 'material-icons', 'verified');
      const wrap = el('div');
      wrap.appendChild(el('h4', null, 'Regra Atual'));
      wrap.appendChild(el('p', 'output', message));
      const actions = el('div', 'config-actions');
      actions.appendChild(editBtn);
      actions.appendChild(removeBtn);
      wrap.appendChild(actions);
      c.appendChild(icon);
      c.appendChild(wrap);
      return c;
    })();
  configContainer.appendChild(card);

  editBtn.addEventListener('click', () => openConfigModal(data));
  removeBtn.addEventListener('click', () => withButtonLock(removeBtn, async () => {
    try {
      await request('/configuracoes/descontos', { method: 'DELETE' });
      showToast('Regra removida.');
      loadConfig();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
}

function openConfigModal(data) {
  const modalForm = adminModals.createModalForm
    ? adminModals.createModalForm({ actionLabel: 'Salvar', actionClass: 'btn primary', actionAlign: 'center' })
    : null;
  const container = modalForm?.container || el('div');
  const grid = modalForm?.grid || el('div', 'form-grid');

  const inputQtd = createInput({ type: 'number', min: 1, value: data?.desconto_qtd_concluidos });
  const inputValor = createInput({
    type: 'number',
    min: 1,
    step: '0.01',
    value: data?.desconto_valor_centavos ? (data.desconto_valor_centavos / 100).toFixed(2) : ''
  });
  const groupQtd = createFormGroup('Quantidade de concluídos', inputQtd);
  const groupValor = createFormGroup('Desconto (R$)', inputValor);

  grid.appendChild(groupQtd);
  grid.appendChild(groupValor);

  const saveBtn = modalForm?.primaryBtn || createButton('Salvar', 'btn primary');
  if (!modalForm) {
    const actions = el('div', 'modal-actions center');
    actions.appendChild(saveBtn);
    container.appendChild(grid);
    container.appendChild(actions);
  }

  openModal(data ? 'Editar regra' : 'Criar regra', container);

  saveBtn.addEventListener('click', () => withButtonLock(saveBtn, async () => {
    try {
      const qtd = Number(inputQtd.value);
      const valorReais = Number(inputValor.value);
      if (!qtd || !valorReais) throw new Error('Preencha todos os campos.');
      const payload = {
        desconto_qtd_concluidos: qtd,
        desconto_valor_centavos: Math.round(valorReais * 100)
      };
      await request('/configuracoes/descontos', { method: 'PUT', body: JSON.stringify(payload) });
      closeModal();
      showToast('Regra salva.');
      loadConfig();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
}

btnConfigCreate?.addEventListener('click', () => openConfigModal(null));

async function fetchClientes() {
  const ativo = clientesAtivo.value;
  const query = ativo !== '' ? `?ativo=${ativo}` : '';
  try {
    const data = await request(`/admins/clientes${query}`);
    const termo = (clientesBusca.value || '').toLowerCase();
    const filtrados = termo
      ? data.filter(c => (c.nome || '').toLowerCase().includes(termo) || (c.email || '').toLowerCase().includes(termo))
      : data;
    renderClientes(filtrados);
  } catch (err) {
    renderStatus(clientesList, err.message);
  }
}

loadClientesBtn?.addEventListener('click', () => withButtonLock(loadClientesBtn, fetchClientes));

// submit handler is attached on filter form

function renderClientes(clientes) {
  renderCardList(clientesList, clientes, (c) => {
    if (adminCards.createClienteCard) {
      return adminCards.createClienteCard({
        nome: c.nome,
        email: c.email,
        ativo: c.ativo,
        concluidos: c.concluidos_count || 0,
        desconto: formatCurrency(c.desconto_disponivel_centavos || 0),
        onEdit: () => editarCliente(c),
        onToggle: (btn) => withButtonLock(btn, () => toggleCliente(c.id, c.ativo)),
        onDelete: (btn) => withButtonLock(btn, () => apagarCliente(c.id, c.nome))
      });
    }
    const actions = [];
    const editBtn = createButton('Editar', 'btn ghost');
    const toggleBtn = createButton(c.ativo === 1 ? 'Desativar' : 'Ativar', `btn ${c.ativo === 1 ? 'danger' : ''}`);
    const deleteBtn = createButton('Apagar', 'btn danger');
    actions.push(editBtn, toggleBtn, deleteBtn);

    const card = createCardWithLines({
      title: c.nome,
      lines: [
        c.email,
        `Status: ${c.ativo === 1 ? 'Ativo' : 'Desativado'}`,
        `Concluídos: ${c.concluidos_count || 0}`,
        `Desconto: ${formatCurrency(c.desconto_disponivel_centavos || 0)}`
      ],
      actions
    });

    editBtn.addEventListener('click', () => editarCliente(c));
    toggleBtn.addEventListener('click', () => withButtonLock(toggleBtn, () => toggleCliente(c.id, c.ativo)));
    deleteBtn.addEventListener('click', () => withButtonLock(deleteBtn, () => apagarCliente(c.id, c.nome)));
    return card;
  }, { emptyMessage: 'Sem clientes.' });
}

function editarCliente(cliente) {
  const container = el('div');
  const grid = el('div', 'form-grid');

  const nameInput = createInput({ value: cliente.nome || '' });
  const emailInput = createInput({ value: cliente.email || '' });
  const telInput = createInput({ value: cliente.telefone || '' });
  const ativoSelect = createSelect({
    value: cliente.ativo === 1 ? '1' : '0',
    options: [
      { value: '1', label: 'Ativo' },
      { value: '0', label: 'Inativo' }
    ]
  });

  const nameGroup = createFormGroup('Nome', nameInput);
  const emailGroup = createFormGroup('Email', emailInput);
  const telGroup = createFormGroup('Telefone', telInput);
  const ativoGroup = createFormGroup('Ativo', ativoSelect);

  grid.appendChild(nameGroup);
  grid.appendChild(emailGroup);
  grid.appendChild(telGroup);
  grid.appendChild(ativoGroup);

  const saveBtn = createButton('Salvar', 'btn primary');

  container.appendChild(grid);
  container.appendChild(saveBtn);

  openModal('Editar Cliente', container);

  saveBtn.addEventListener('click', () => withButtonLock(saveBtn, async () => {
    try {
      await request(`/admins/clientes/${cliente.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nome: nameInput.value,
          email: emailInput.value,
          telefone: telInput.value,
          ativo: Number(ativoSelect.value)
        })
      });
      closeModal();
      showToast('Cliente atualizado.');
      loadClientesBtn.click();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
}

async function toggleCliente(id, ativoAtual) {
  try {
    if (ativoAtual === 1) {
      await request(`/admins/clientes/${id}`, { method: 'DELETE' });
      showToast('Cliente desativado.');
    } else {
      await request(`/admins/clientes/${id}`, { method: 'PUT', body: JSON.stringify({ ativo: 1 }) });
      showToast('Cliente ativado.');
    }
    loadClientesBtn.click();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function apagarCliente(id, nome) {
  const ok = await askDeleteConfirmation({
    title: 'Apagar cliente',
    message: `Apagar permanentemente o cliente "${nome}"? Esta ação não pode ser desfeita.`
  })
  if (!ok) return
  try {
    await request(`/admins/clientes/${id}/permanente`, { method: 'DELETE' })
    showToast('Cliente apagado permanentemente.')
    loadClientesBtn.click()
  } catch (err) {
    showToast(err.message, 'error')
  }
}

async function fetchAgendamentos() {
  try {
    const data = await request('/agendamentos');
    const status = agendamentosStatus.value;
    const termo = (agendamentosBusca.value || '').trim().toLowerCase();
    const barbeiroId = (agendamentosBarbeiro?.value || '').trim();
    const dataFiltro = (agendamentosData?.value || '').trim();
    const filtrados = data.filter(a => {
      if (status && a.status !== status) return false;
      if (barbeiroId) {
        const atual = String(a.barbeiro?.id ?? a.barbeiro_id ?? '');
        if (atual !== barbeiroId) return false;
      }
      if (dataFiltro) {
        const inicio = a.inicio ? new Date(a.inicio) : null;
        if (!inicio || Number.isNaN(inicio.getTime())) return false;
        const inicioLocal = formatDateISO(inicio);
        if (inicioLocal !== dataFiltro) return false;
      }
      if (!termo) return true;
      const clienteNome = (a.cliente?.nome || a.cliente_nome || a.clienteName || '').toLowerCase();
      return clienteNome.includes(termo);
    });
    renderAgendamentos(filtrados);
  } catch (err) {
    renderStatus(agendamentosList, err.message);
  }
}

loadAgendamentosBtn?.addEventListener('click', () => withButtonLock(loadAgendamentosBtn, fetchAgendamentos));

// submit handler is attached on filter form

function renderAgendamentos(items) {
  renderCardList(agendamentosList, items, (a) => {
    const clienteNome =
      a.cliente?.nome ||
      a.cliente_nome ||
      a.clienteName ||
      (a.cliente_id ? `#${a.cliente_id}` : '—');
    const actions = [];
    const detailsBtn = createButton('Detalhes', 'btn ghost');
    const concludeBtn = createButton('Concluir', 'btn primary');
    const cancelBtn = createButton('Cancelar', 'btn danger');
    actions.push(detailsBtn, concludeBtn, cancelBtn);

    const lines = [
      `Cliente: ${clienteNome}`,
      `Barbeiro: ${a.barbeiro?.nome_profissional || a.barbeiro_id}`,
      `Início: ${formatDateTimeBR(a.inicio)}`,
      `Valor: ${formatCurrency(a.valor_total_centavos)}`
    ];
    if (a.pagamento_tipo) lines.push(`Pagamento: ${a.pagamento_tipo}`);

    const priceComponents = [];
    if (a.pagamento_tipo) {
      priceComponents.push({ label: 'Pagamento:', value: a.pagamento_tipo });
    }
    priceComponents.push({ label: 'Valor:', value: formatCurrency(a.valor_total_centavos), isTotal: true });

    const card = adminCards.createAgendamentoCard
      ? adminCards.createAgendamentoCard({
        id: a.id,
        status: a.status,
        clientName: clienteNome,
        barberName: a.barbeiro?.nome_profissional || a.barbeiro_id,
        dateText: formatDateTimeBR(a.inicio),
        priceComponents,
        actions
      })
      : createCardWithLines({
        title: `#${a.id} - ${a.status}`,
        lines,
        actions
      });

    detailsBtn.addEventListener('click', () => verDetalhes(a));
    if (a.status === 'SOLICITADO') {
      concludeBtn.textContent = 'Aceitar';
      cancelBtn.textContent = 'Recusar';
      concludeBtn.addEventListener('click', () => withButtonLock(concludeBtn, () => aceitarAgendamento(a.id)));
      cancelBtn.addEventListener('click', () => withButtonLock(cancelBtn, () => recusarAgendamento(a.id)));
    } else {
      if (a.status === 'CONCLUIDO') {
        concludeBtn.textContent = 'Concluído';
        concludeBtn.disabled = true;
      } else if (a.status === 'CANCELADO' || a.status === 'RECUSADO') {
        concludeBtn.textContent = 'Concluir';
        concludeBtn.disabled = true;
      } else {
        concludeBtn.addEventListener('click', () => abrirConcluirAgendamento(a.id));
      }

      if (a.status === 'CANCELADO') {
        cancelBtn.textContent = 'Cancelado';
        cancelBtn.disabled = true;
      } else if (a.status === 'RECUSADO') {
        cancelBtn.textContent = 'Recusado';
        cancelBtn.disabled = true;
      } else if (a.status === 'CONCLUIDO') {
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.disabled = true;
      } else {
        cancelBtn.addEventListener('click', () => withButtonLock(cancelBtn, () => cancelarAgendamento(a.id)));
      }
    }

    return card;
  }, { emptyMessage: 'Sem agendamentos.' });
}

function verDetalhes(agendamento) {
  const detailsLayout = adminModals.createDetailsLayout
    ? adminModals.createDetailsLayout({ leftTitle: 'Serviços', rightTitle: 'Vagas' })
    : null;
  const container = detailsLayout?.container || el('div');
  const grid = detailsLayout?.grid || el('div', 'details-grid');

  const clienteNome =
    agendamento.cliente?.nome ||
    agendamento.cliente_nome ||
    agendamento.clienteName ||
    (agendamento.cliente_id ? `#${agendamento.cliente_id}` : '—');

  grid.appendChild(createInfoRow('Status:', agendamento.status));
  grid.appendChild(createInfoRow('Cliente:', clienteNome));
  grid.appendChild(createInfoRow('Barbeiro:', agendamento.barbeiro?.nome_profissional || agendamento.barbeiro_id));
  grid.appendChild(createInfoRow('Início:', formatDateTimeBR(agendamento.inicio)));
  grid.appendChild(createInfoRow('Fim:', formatDateTimeBR(agendamento.fim)));
  grid.appendChild(createInfoRow('Preço original:', formatCurrency(agendamento.valor_original_centavos)));
  grid.appendChild(createInfoRow('Desconto:', formatCurrency(agendamento.desconto_aplicado_centavos)));
  grid.appendChild(createInfoRow('Final:', formatCurrency(agendamento.valor_total_centavos)));
  if (agendamento.pagamento_tipo) {
    grid.appendChild(createInfoRow('Pagamento:', agendamento.pagamento_tipo));
  }

  const columns = detailsLayout?.columns || el('div', 'details-columns');
  const servicosBox = detailsLayout?.leftBox || el('div', 'details-box');
  const servicosList = detailsLayout?.leftList || el('ul');
  if (!detailsLayout) {
    servicosBox.appendChild(el('strong', null, 'Serviços'));
    servicosBox.appendChild(servicosList);
  }
  (agendamento.servicos || []).forEach(s => {
    servicosList.appendChild(el('li', null, `${s.nome} (${s.duracao_minutos} min)`));
  });
  if (!agendamento.servicos || agendamento.servicos.length === 0) {
    servicosList.appendChild(el('li', null, 'Sem serviços'));
  }

  const vagasBox = detailsLayout?.rightBox || el('div', 'details-box');
  const vagasUl = detailsLayout?.rightList || el('ul');
  if (!detailsLayout) {
    vagasBox.appendChild(el('strong', null, 'Vagas'));
    vagasBox.appendChild(vagasUl);
  }
  (agendamento.vagas || []).forEach(v => {
    vagasUl.appendChild(el('li', null, `${formatDateTimeBR(v.inicio)} - ${v.status}`));
  });
  if (!agendamento.vagas || agendamento.vagas.length === 0) {
    vagasUl.appendChild(el('li', null, 'Sem vagas'));
  }
  if (!detailsLayout) {
    columns.appendChild(servicosBox);
    columns.appendChild(vagasBox);
    container.appendChild(grid);
    container.appendChild(columns);
  }

  openModal(`Agendamento #${agendamento.id}`, container);
}

function abrirConcluirAgendamento(id) {
  const modalForm = adminModals.createModalForm
    ? adminModals.createModalForm({ actionLabel: 'Concluir', actionClass: 'btn primary', actionAlign: 'center' })
    : null;
  const container = modalForm?.container || el('div');
  const grid = modalForm?.grid || el('div', 'form-grid');

  const select = createSelect({
    options: [
      { value: 'DINHEIRO', label: 'DINHEIRO' },
      { value: 'PIX', label: 'PIX' },
      { value: 'CARTAO', label: 'CARTÃO' }
    ]
  });
  const g1 = createFormGroup('Forma de pagamento', select);
  grid.appendChild(g1);

  const confirmBtn = modalForm?.primaryBtn || createButton('Concluir', 'btn');
  if (!modalForm) {
    container.appendChild(grid);
    container.appendChild(confirmBtn);
  }

  openModal('Concluir agendamento', container);

  confirmBtn.addEventListener('click', () => withButtonLock(confirmBtn, async () => {
    try {
      await request(`/agendamentos/${id}/concluir`, {
        method: 'POST',
        body: JSON.stringify({ pagamento_tipo: select.value })
      });
      closeModal();
      loadAgendamentosBtn.click();
      showToast('Agendamento concluído.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
}

async function cancelarAgendamento(id) {
  try {
    await request(`/agendamentos/${id}/cancelar`, { method: 'POST' });
    loadAgendamentosBtn.click();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function aceitarAgendamento(id) {
  try {
    await request(`/agendamentos/${id}/aceitar`, { method: 'POST' });
    loadAgendamentosBtn.click();
    showToast('Agendamento aceito.');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function recusarAgendamento(id) {
  try {
    await request(`/agendamentos/${id}/recusar`, { method: 'POST' });
    loadAgendamentosBtn.click();
    showToast('Agendamento recusado.');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

formVagas.addEventListener('submit', (e) => {
  e.preventDefault();
  const submitBtn = e.submitter;
  return withButtonLock(submitBtn, async () => {
    const barbeiroId = qs('vagas-barbeiro').value;
    const data = qs('vagas-data').value;
    try {
      const vagas = await request(`/vagas/todos?barbeiroId=${barbeiroId}&data=${data}`);
      renderVagas(vagas);
    } catch (err) {
      renderStatus(vagasList, err.message);
    }
  });
});

function renderVagas(vagas) {
  renderCardList(vagasList, vagas, (v) => {
    const actions = [];
    const blockBtn = createButton('Bloquear', 'btn ghost');
    const deleteBtn = createButton('Apagar', 'btn danger');
    actions.push(blockBtn, deleteBtn);

    const lines = [
      `Início: ${formatDateTimeBR(v.inicio)}`,
      `Fim: ${formatDateTimeBR(v.fim)}`
    ];

    const card = adminCards.createVagaCard
      ? adminCards.createVagaCard({
        id: v.id,
        status: v.status,
        lines,
        actions
      })
      : createCardWithLines({
        title: `#${v.id} - ${v.status}`,
        lines,
        actions
      });

    blockBtn.addEventListener('click', () => abrirBloqueioVaga(v.barbeiro_id || 0, v.inicio));
    deleteBtn.addEventListener('click', () => withButtonLock(deleteBtn, () => apagarVaga(v.id)));
    return card;
  }, { emptyMessage: 'Sem vagas.' });
}

btnAbrirGerar?.addEventListener('click', () => {
  const modalForm = adminModals.createModalForm
    ? adminModals.createModalForm({ actionLabel: 'Gerar', actionClass: 'btn primary', actionAlign: 'center' })
    : null;
  const container = modalForm?.container || el('div');
  const grid = modalForm?.grid || el('div', 'form-grid');

  const s1 = createSelect({ className: 'barbeiro-select' });
  populateBarbeiroSelect(s1);
  const d2 = createInput({ type: 'date' });
  const t3 = createInput({ type: 'time', step: 60 });
  const t4 = createInput({ type: 'time', step: 60 });
  const d5 = createInput({ type: 'number', min: 5, value: 30 });

  const g1 = createFormGroup('Barbeiro', s1);
  const g2 = createFormGroup('Data', d2);
  const g3 = createFormGroup('Início expediente', t3);
  const g4 = createFormGroup('Fim expediente', t4);
  const g5 = createFormGroup('Duração (min)', d5);

  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);
  grid.appendChild(g5);

  const confirmBtn = modalForm?.primaryBtn || createButton('Gerar', 'btn');
  if (!modalForm) {
    container.appendChild(grid);
    container.appendChild(confirmBtn);
  }

  openModal('Gerar vagas', container);

  confirmBtn.addEventListener('click', () => withButtonLock(confirmBtn, async () => {
    try {
      const payload = {
        barbeiroId: Number(s1.value),
        data: d2.value,
        inicioExpediente: t3.value,
        fimExpediente: t4.value,
        duracaoSlot: Number(d5.value)
      };
      const vagas = await request('/vagas/gerar', { method: 'POST', body: JSON.stringify(payload) });
      renderVagas(vagas);
      closeModal();
      showToast('Vagas geradas.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
});

btnAbrirBloqueio?.addEventListener('click', () => {
  const modalForm = adminModals.createModalForm
    ? adminModals.createModalForm({ actionLabel: 'Bloquear', actionClass: 'btn primary', actionAlign: 'center' })
    : null;
  const container = modalForm?.container || el('div');
  const grid = modalForm?.grid || el('div', 'form-grid');

  const s1 = createSelect({ className: 'barbeiro-select' });
  populateBarbeiroSelect(s1);
  const d2 = createInput({ type: 'date' });
  const t3 = createInput({ type: 'time', step: 60 });
  const t4 = createInput({ type: 'time', step: 60 });
  const t5 = createInput();

  const g1 = createFormGroup('Barbeiro', s1);
  const g2 = createFormGroup('Data', d2);
  const g3 = createFormGroup('Início', t3);
  const g4 = createFormGroup('Fim', t4);
  const g5 = createFormGroup('Motivo', t5);

  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);
  grid.appendChild(g5);

  const confirmBtn = modalForm?.primaryBtn || createButton('Bloquear', 'btn');
  if (!modalForm) {
    container.appendChild(grid);
    container.appendChild(confirmBtn);
  }

  openModal('Bloquear horário', container);

  confirmBtn.addEventListener('click', () => withButtonLock(confirmBtn, async () => {
    try {
      const payload = {
        barbeiroId: Number(s1.value),
        inicio: toIsoWithOffset(d2.value, t3.value),
        fim: toIsoWithOffset(d2.value, t4.value),
        motivo: t5.value
      };
      const resp = await request('/vagas/bloquear', { method: 'POST', body: JSON.stringify(payload) });
      renderVagas(resp.bloqueados || []);
      closeModal();
      showToast('Horário bloqueado.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
});

btnAbrirReserva?.addEventListener('click', () => {
  const modalForm = adminModals.createModalForm
    ? adminModals.createModalForm({ actionLabel: 'Reservar', actionClass: 'btn primary', actionAlign: 'center' })
    : null;
  const container = modalForm?.container || el('div');
  const grid = modalForm?.grid || el('div', 'form-grid');

  const s1 = createSelect({ className: 'barbeiro-select' });
  populateBarbeiroSelect(s1);
  const d2 = createInput({ type: 'date' });
  const t3 = createInput({ type: 'time', step: 60 });
  const d4 = createInput({ type: 'number', min: 5, value: 30 });

  const g1 = createFormGroup('Barbeiro', s1);
  const g2 = createFormGroup('Data', d2);
  const g3 = createFormGroup('Hora', t3);
  const g4 = createFormGroup('Duração (min)', d4);

  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);

  const confirmBtn = modalForm?.primaryBtn || createButton('Reservar', 'btn');
  if (!modalForm) {
    container.appendChild(grid);
    container.appendChild(confirmBtn);
  }

  openModal('Reservar vagas', container);

  confirmBtn.addEventListener('click', () => withButtonLock(confirmBtn, async () => {
    try {
      const payload = {
        barbeiroId: Number(s1.value),
        inicioDesejado: toIsoWithOffset(d2.value, t3.value),
        duracaoMinutos: Number(d4.value)
      };
      const resp = await request('/vagas/reservar', { method: 'POST', body: JSON.stringify(payload) });
      renderVagas(resp || []);
      closeModal();
      showToast('Vagas reservadas.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
});

async function apagarVaga(id) {
  try {
    await request('/vagas/apagar', { method: 'DELETE', body: JSON.stringify({ vagaId: id }) });
    showToast('Vaga apagada.');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function abrirBloqueioVaga(barbeiroId, inicio) {
  const dt = new Date(inicio);
  const data = dt.toISOString().slice(0, 10);
  const hora = dt.toISOString().slice(11, 16);

  const modalForm = adminModals.createModalForm
    ? adminModals.createModalForm({ actionLabel: 'Bloquear', actionClass: 'btn primary', actionAlign: 'center' })
    : null;
  const container = modalForm?.container || el('div');
  const grid = modalForm?.grid || el('div', 'form-grid');

  const s1 = createSelect({ className: 'barbeiro-select' });
  populateBarbeiroSelect(s1, barbeiroId);
  const d2 = createInput({ type: 'date', value: data });
  const t3 = createInput({ type: 'time', value: hora });
  const t4 = createInput({ type: 'time', value: hora });

  const g1 = createFormGroup('Barbeiro', s1);
  const g2 = createFormGroup('Data', d2);
  const g3 = createFormGroup('Início', t3);
  const g4 = createFormGroup('Fim', t4);

  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);

  const confirmBtn = modalForm?.primaryBtn || createButton('Bloquear', 'btn');
  if (!modalForm) {
    container.appendChild(grid);
    container.appendChild(confirmBtn);
  }

  openModal('Bloquear vaga', container);

  confirmBtn.addEventListener('click', () => withButtonLock(confirmBtn, async () => {
    try {
      const payload = {
        barbeiroId: Number(s1.value),
        inicio: toIsoWithOffset(d2.value, t3.value),
        fim: toIsoWithOffset(d2.value, t4.value),
        motivo: 'Bloqueio manual'
      };
      const resp = await request('/vagas/bloquear', { method: 'POST', body: JSON.stringify(payload) });
      renderVagas(resp.bloqueados || []);
      closeModal();
      showToast('Vaga bloqueada.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
}

loadServicosBtn?.addEventListener('click', () => withButtonLock(loadServicosBtn, async () => {
  try {
    const data = await request('/servicos');
    renderServicos(data);
  } catch (err) {
    renderStatus(servicosList, err.message);
  }
}));

btnNovoServico?.addEventListener('click', () => {
  const modalForm = adminModals.createModalForm
    ? adminModals.createModalForm({ actionLabel: 'Registrar', actionClass: 'btn primary', actionAlign: 'center' })
    : null;
  const container = modalForm?.container || el('div');
  const grid = modalForm?.grid || el('div', 'form-grid');

  const s0 = createSelect({ className: 'barbeiro-select' });
  populateBarbeiroSelect(s0);
  const i1 = createInput();
  const i2 = createInput();
  const i3 = createInput({ type: 'number', min: 1 });
  const i4 = createInput({ type: 'number', min: 0, step: '0.01' });

  const g0 = createFormGroup('Barbeiro', s0);
  const g1 = createFormGroup('Nome', i1);
  const g2 = createFormGroup('Descrição', i2);
  const g3 = createFormGroup('Duração (minutos)', i3);
  const g4 = createFormGroup('Preço (R$)', i4);

  grid.appendChild(g0);
  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);

  const saveBtn = modalForm?.primaryBtn || createButton('Registrar', 'btn');
  if (!modalForm) {
    container.appendChild(grid);
    container.appendChild(saveBtn);
  }

  openModal('Registrar serviço', container);

  saveBtn.addEventListener('click', () => withButtonLock(saveBtn, async () => {
    try {
      const payload = {
        barbeiro_id: Number(s0.value),
        nome: i1.value,
        descricao: i2.value,
        duracao_minutos: Number(i3.value),
        preco_centavos: Math.round(Number(i4.value) * 100)
      };
      await request('/servicos', { method: 'POST', body: JSON.stringify(payload) });
      closeModal();
      showToast('Serviço criado.');
      loadServicosBtn.click();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
});

function renderServicos(items) {
  renderCardList(servicosList, items, (s) => {
    if (adminCards.createServiceCard) {
      return adminCards.createServiceCard({
        id: s.id,
        name: s.nome,
        description: s.descricao,
        duration: s.duracao_minutos,
        priceText: formatCurrency(s.preco_centavos),
        barbeiroNome: getBarbeiroNomeById(s.barbeiro_id),
        mediaUrl: s.foto_url,
        ativo: s.ativo,
        onEdit: () => editarServico(s),
        onToggle: (btn) => withButtonLock(btn, () => toggleServico(s.id, s.ativo)),
        onDelete: (btn) => withButtonLock(btn, () => apagarServico(s.id, s.nome))
      });
    }

    const media = createMedia({
      url: s.foto_url,
      alt: s.nome,
      icon: 'image',
      className: 'service-media'
    });

    const actions = [];
    const editBtn = createButton('Editar', 'btn ghost');
    const toggleBtn = createButton(s.ativo === 1 ? 'Desativar' : 'Ativar', `btn ${s.ativo === 1 ? 'danger' : ''}`);
    const deleteBtn = createButton('Apagar', 'btn danger');
    actions.push(editBtn, toggleBtn, deleteBtn);

    const card = createCardWithLines({
      title: s.nome,
      lines: [
        s.descricao || '-',
        `Barbeiro: ${getBarbeiroNomeById(s.barbeiro_id)}`,
        `Duração: ${s.duracao_minutos} min`,
        `Preço: ${formatCurrency(s.preco_centavos)}`
      ],
      actions
    });
    card.dataset.id = String(s.id);
    card.insertBefore(media, card.firstChild);

    editBtn.addEventListener('click', () => editarServico(s));
    toggleBtn.addEventListener('click', () => withButtonLock(toggleBtn, () => toggleServico(s.id, s.ativo)));
    deleteBtn.addEventListener('click', () => withButtonLock(deleteBtn, () => apagarServico(s.id, s.nome)));
    return card;
  }, { emptyMessage: 'Sem serviços.' });
}

function editarServico(servico) {
  const modalGrid = adminModals.createModalGrid
    ? adminModals.createModalGrid({ gridClass: 'form-grid service-form', containerClass: 'modal-form service-modal' })
    : null;
  const container = modalGrid?.container || el('div');
  const grid = modalGrid?.grid || el('div', 'form-grid service-form');
  if (!modalGrid) container.classList.add('modal-form', 'service-modal');

  const photo = createPhotoGroup?.({
    label: 'Imagem',
    icon: 'image',
    imageUrl: servico.foto_url,
    alt: servico.nome,
    changeLabel: 'Trocar imagem',
    removeLabel: 'Remover imagem',
    onFileSelected: ({ file, updatePreview, input, removeBtn }) => {
      const err = validateImageFile(file);
      if (err) {
        showToast(err, 'error');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        updatePreview(String(reader.result));
        removeBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    },
    onRemove: () => { }
  });
  const fotoGroup = photo?.group || el('div', 'form-group photo-group');
  const preview = photo?.preview;
  const fotoInput = photo?.fileInput;
  const removeBtn = photo?.removeBtn;

  const s0 = createSelect({ className: 'barbeiro-select' });
  populateBarbeiroSelect(s0, servico.barbeiro_id);
  const g0 = createFormGroup('Barbeiro', s0);

  const i1 = createInput({ value: servico.nome || '' });
  const i2 = createInput({ value: servico.descricao || '' });
  const i3 = createInput({ type: 'number', value: servico.duracao_minutos });
  const i4 = createInput({
    type: 'number',
    step: '0.01',
    value: servico.preco_centavos ? (servico.preco_centavos / 100).toFixed(2) : ''
  });

  const g1 = createFormGroup('Nome', i1);
  const g2 = createFormGroup('Descrição', i2);
  const g3 = createFormGroup('Duração (minutos)', i3);
  const g4 = createFormGroup('Preço (R$)', i4);

  grid.appendChild(fotoGroup);
  grid.appendChild(g0);
  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);

  const actions = el('div', 'modal-actions center');
  const saveBtn = el('button', 'btn primary', 'Salvar');
  actions.appendChild(saveBtn);

  container.appendChild(grid);
  container.appendChild(actions);

  openModal('Editar Serviço', container);

  if (!servico.foto_url && removeBtn) {
    removeBtn.disabled = true;
  }

  fotoInput?.addEventListener('change', async () => {
    const file = fotoInput.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      showToast(err, 'error');
      fotoInput.value = '';
      return;
    }
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const updated = await requestFormData(`/servicos/${servico.id}/foto`, formData);
      servico.foto_url = updated?.foto_url || servico.foto_url;
      if (servico.foto_url && preview) {
        const img = document.createElement('img');
        img.src = servico.foto_url;
        img.alt = servico.nome;
        img.onerror = () => {
          preview.replaceChildren(el('span', 'material-icons', 'image'));
        };
        preview.replaceChildren(img);
        if (removeBtn) removeBtn.disabled = false;
      }
      const cardMedia = document.querySelector(`.card[data-id="${servico.id}"] .service-media`);
      if (cardMedia) {
        const img = document.createElement('img');
        img.src = servico.foto_url;
        img.alt = servico.nome;
        img.onerror = () => {
          cardMedia.replaceChildren(el('span', 'material-icons', 'image'));
        };
        cardMedia.replaceChildren(img);
      }
      showToast('Imagem atualizada.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      fotoInput.value = '';
    }
  });

  removeBtn?.addEventListener('click', () => withButtonLock(removeBtn, async () => {
    try {
      const updated = await request(`/servicos/${servico.id}/foto`, { method: 'DELETE' });
      servico.foto_url = updated?.foto_url || null;
      if (preview) preview.replaceChildren(el('span', 'material-icons', 'image'));
      const cardMedia = document.querySelector(`.card[data-id="${servico.id}"] .service-media`);
      if (cardMedia) {
        cardMedia.replaceChildren(el('span', 'material-icons', 'image'));
      }
      if (removeBtn) removeBtn.disabled = true;
      showToast('Imagem removida.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));

  saveBtn.addEventListener('click', () => withButtonLock(saveBtn, async () => {
    try {
      await request(`/servicos/${servico.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          barbeiro_id: Number(s0.value),
          nome: i1.value,
          descricao: i2.value,
          duracao_minutos: Number(i3.value),
          preco_centavos: Math.round(Number(i4.value) * 100)
        })
      });
      closeModal();
      showToast('Serviço atualizado.');
      loadServicosBtn.click();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
}

async function toggleServico(id, ativoAtual) {
  try {
    if (ativoAtual === 1) {
      await request(`/servicos/${id}`, { method: 'DELETE' });
      showToast('Serviço desativado.');
    } else {
      await request(`/servicos/${id}`, { method: 'PUT', body: JSON.stringify({ ativo: 1 }) });
      showToast('Serviço ativado.');
    }
    loadServicosBtn.click();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function apagarServico(id, nome) {
  const ok = await askDeleteConfirmation({
    title: 'Apagar serviço',
    message: `Apagar permanentemente o serviço "${nome}"? Esta ação não pode ser desfeita.`
  })
  if (!ok) return
  try {
    await request(`/servicos/${id}/permanente`, { method: 'DELETE' })
    showToast('Serviço apagado permanentemente.')
    loadServicosBtn.click()
  } catch (err) {
    showToast(err.message, 'error')
  }
}

loadBarbeirosBtn?.addEventListener('click', () => withButtonLock(loadBarbeirosBtn, async () => {
  try {
    const data = await request('/barbeiros');
    cachedBarbeiros = data || [];
    populateBarbeiroSelects();
    renderBarbeiros(data);
  } catch (err) {
    clear(barbeirosList);
    barbeirosList.appendChild(el('div', 'status', err.message));
  }
}));

btnNovoBarbeiro?.addEventListener('click', () => {
  const modalForm = adminModals.createModalForm
    ? adminModals.createModalForm({ actionLabel: 'Registrar', actionClass: 'btn primary', actionAlign: 'center' })
    : null;
  const container = modalForm?.container || el('div');
  const grid = modalForm?.grid || el('div', 'form-grid');

  const i1 = createInput();
  const i2 = createInput();
  const g1 = createFormGroup('Nome profissional', i1);
  const g2 = createFormGroup('Bio', i2);

  grid.appendChild(g1);
  grid.appendChild(g2);

  const saveBtn = modalForm?.primaryBtn || createButton('Registrar', 'btn');
  if (!modalForm) {
    container.appendChild(grid);
    container.appendChild(saveBtn);
  }

  openModal('Registrar barbeiro', container);

  saveBtn.addEventListener('click', () => withButtonLock(saveBtn, async () => {
    try {
      const payload = {
        nome_profissional: i1.value,
        bio: i2.value
      };
      await request('/barbeiros', { method: 'POST', body: JSON.stringify(payload) });
      closeModal();
      showToast('Barbeiro criado.');
      loadBarbeirosBtn.click();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
});

function renderBarbeiros(items) {
  renderCardList(barbeirosList, items, (b) => {
    if (adminCards.createBarbeiroCard) {
      return adminCards.createBarbeiroCard({
        nome: b.nome_profissional,
        bio: b.bio,
        ativo: b.ativo,
        mediaUrl: b.foto_url,
        onEdit: () => editarBarbeiro(b),
        onToggle: (btn) => withButtonLock(btn, () => toggleBarbeiro(b.id, b.ativo)),
        onDelete: (btn) => withButtonLock(btn, () => apagarBarbeiro(b.id, b.nome_profissional))
      });
    }

    const card = createCard('card');
    const header = el('div', 'card-header vertical');
    const avatar = createMedia({
      url: b.foto_url,
      alt: b.nome_profissional || 'Barbeiro',
      icon: 'person',
      className: 'avatar avatar-large'
    });
    const titleBox = el('div', 'card-title');
    titleBox.appendChild(el('strong', null, b.nome_profissional));
    titleBox.appendChild(el('small', null, b.bio || '-'));
    header.appendChild(avatar);
    header.appendChild(titleBox);
    card.appendChild(header);
    card.appendChild(el('small', null, `Status: ${b.ativo === 1 ? 'Ativo' : 'Desativado'}`));

    const editBtn = createButton('Editar', 'btn ghost');
    const toggleBtn = createButton(b.ativo === 1 ? 'Desativar' : 'Ativar', `btn ${b.ativo === 1 ? 'danger' : ''}`);
    const deleteBtn = createButton('Apagar', 'btn danger');
    card.appendChild(createActionsRow([editBtn, toggleBtn, deleteBtn]));

    editBtn.addEventListener('click', () => editarBarbeiro(b));
    toggleBtn.addEventListener('click', () => withButtonLock(toggleBtn, () => toggleBarbeiro(b.id, b.ativo)));
    deleteBtn.addEventListener('click', () => withButtonLock(deleteBtn, () => apagarBarbeiro(b.id, b.nome_profissional)));
    return card;
  }, { emptyMessage: 'Sem barbeiros.' });
}

function editarBarbeiro(barbeiro) {
  const modalGrid = adminModals.createModalGrid
    ? adminModals.createModalGrid({ gridClass: 'form-grid barber-form', containerClass: 'modal-form barbeiro-modal' })
    : null;
  const container = modalGrid?.container || el('div');
  const grid = modalGrid?.grid || el('div', 'form-grid barber-form');
  if (!modalGrid) container.classList.add('modal-form', 'barbeiro-modal');

  const i1 = createInput({ value: barbeiro.nome_profissional || '' });
  const i2 = createInput({ value: barbeiro.bio || '' });
  const s1 = createSelect({
    value: barbeiro.ativo === 1 ? '1' : '0',
    options: [
      { value: '1', label: 'Ativo' },
      { value: '0', label: 'Inativo' }
    ]
  });
  const g1 = createFormGroup('Nome', i1);
  const g2 = createFormGroup('Bio', i2);
  const g3 = createFormGroup('Ativo', s1);

  const photo = createPhotoGroup?.({
    label: 'Foto',
    icon: 'person',
    imageUrl: barbeiro.foto_url,
    alt: barbeiro.nome_profissional || 'Barbeiro',
    changeLabel: 'Trocar foto',
    removeLabel: 'Remover foto',
    onFileSelected: ({ file, updatePreview, input, removeBtn }) => {
      const error = validateImageFile(file);
      if (error) {
        showToast(error, 'error');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        updatePreview(String(reader.result));
        removeBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    },
    onRemove: () => { }
  });
  const fotoGroup = photo?.group || el('div', 'form-group photo-group');
  const preview = photo?.preview;
  const fotoInput = photo?.fileInput;
  const removeBtn = photo?.removeBtn;

  grid.appendChild(fotoGroup);
  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);

  const saveBtn = createButton('Salvar', 'btn primary');
  const actions = el('div', 'modal-actions center');
  actions.appendChild(saveBtn);
  container.appendChild(grid);
  container.appendChild(actions);

  openModal('Editar Barbeiro', container);

  if (!barbeiro.foto_url && removeBtn) {
    removeBtn.disabled = true;
  }

  removeBtn?.addEventListener('click', () => withButtonLock(removeBtn, async () => {
    try {
      await request(`/barbeiros/${barbeiro.id}/foto`, { method: 'DELETE' });
      barbeiro.foto_url = null;
      if (preview) {
        preview.replaceChildren();
        preview.appendChild(el('span', 'material-icons', 'person'));
      }
      if (removeBtn) removeBtn.disabled = true;
      showToast('Foto removida.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));

  saveBtn.addEventListener('click', () => withButtonLock(saveBtn, async () => {
    try {
      if (fotoInput?.files && fotoInput.files[0]) {
        const formData = new FormData();
        formData.append('foto', fotoInput.files[0]);
        const updated = await requestFormData(`/barbeiros/${barbeiro.id}/foto`, formData);
        barbeiro.foto_url = updated?.foto_url || barbeiro.foto_url;
      }
      await request(`/barbeiros/${barbeiro.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nome_profissional: i1.value,
          bio: i2.value,
          ativo: Number(s1.value)
        })
      });
      closeModal();
      showToast('Barbeiro atualizado.');
      loadBarbeirosBtn.click();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));
}

async function toggleBarbeiro(id, ativoAtual) {
  try {
    if (ativoAtual === 1) {
      await request(`/barbeiros/${id}`, { method: 'DELETE' });
      showToast('Barbeiro desativado.');
    } else {
      await request(`/barbeiros/${id}`, { method: 'PUT', body: JSON.stringify({ ativo: 1 }) });
      showToast('Barbeiro ativado.');
    }
    loadBarbeirosBtn.click();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function apagarBarbeiro(id, nome) {
  const ok = await askDeleteConfirmation({
    title: 'Apagar barbeiro',
    message: `Apagar permanentemente o barbeiro "${nome}"? Esta ação não pode ser desfeita.`
  })
  if (!ok) return
  try {
    await request(`/barbeiros/${id}/permanente`, { method: 'DELETE' })
    showToast('Barbeiro apagado permanentemente.')
    loadBarbeirosBtn.click()
  } catch (err) {
    showToast(err.message, 'error')
  }
}

// Auto-load lists on initial load //
loadConfig();
loadClientesBtn?.click();
loadServicosBtn?.click();
loadBarbeirosBtn?.click();
loadBarbeirosCache();
