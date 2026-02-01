const apiBase = window.BASE_PATH || '';

function getCookie(name) {
  return document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.split('=')[1];
}

const adminTokenCookie = getCookie('admin_token');
const storedRole = localStorage.getItem('role');
if (!adminTokenCookie || storedRole !== 'admin') {
  window.location.replace(`${apiBase}/admin-login`);
}
const logoutBtn = document.getElementById('logout-btn');

const navItems = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.tab-panel');

const configContainer = document.getElementById('config-card-container');
const btnConfigCreate = document.getElementById('btn-config-create');

const loadClientesBtn = document.getElementById('load-clientes');
const buscarClientesBtn = document.getElementById('buscar-clientes');
const clientesAtivo = document.getElementById('clientes-ativo');
const clientesBusca = document.getElementById('clientes-busca');
const clientesList = document.getElementById('clientes-list');

const loadAgendamentosBtn = document.getElementById('load-agendamentos');
const buscarAgendamentosBtn = document.getElementById('buscar-agendamentos');
const agendamentosStatus = document.getElementById('agendamentos-status');
const agendamentosBusca = document.getElementById('agendamentos-busca');
const agendamentosBarbeiro = document.getElementById('agendamentos-barbeiro');
const agendamentosData = document.getElementById('agendamentos-data');
const agendamentosList = document.getElementById('agendamentos-list');

const formVagas = document.getElementById('form-vagas');
const vagasList = document.getElementById('vagas-list');
const btnAbrirGerar = document.getElementById('btn-abrir-gerar-vagas');
const btnAbrirBloqueio = document.getElementById('btn-abrir-bloqueio');
const btnAbrirReserva = document.getElementById('btn-abrir-reserva');

const loadServicosBtn = document.getElementById('load-servicos');
const servicosList = document.getElementById('servicos-list');
const btnNovoServico = document.getElementById('btn-novo-servico');

const loadBarbeirosBtn = document.getElementById('load-barbeiros');
const barbeirosList = document.getElementById('barbeiros-list');
const btnNovoBarbeiro = document.getElementById('btn-novo-barbeiro');

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
const el = ui.el || ((tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
});
const clear = ui.clear || ((node) => node.replaceChildren());

function getToken() {
  return localStorage.getItem('token') || '';
}

function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

function api(path) {
  return `${apiBase}${path}`;
}

const formatCurrency = ui.formatCurrency || ((centavos) => {
  if (centavos === undefined || centavos === null) return '-';
  return (Number(centavos) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
});

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
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(api(path), { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    throw new Error(data?.error || data || 'Erro ao requisitar');
  }
  return data;
}

async function requestFormData(path, formData) {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(api(path), { method: 'PATCH', headers, body: formData });
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

function openModal(title, contentNode) {
  modalTitle.textContent = title;
  clear(modalBody);
  modalBody.appendChild(contentNode);
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  clear(modalBody);
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

navItems.forEach(item => {
  item.addEventListener('click', () => switchTab(item.dataset.tab));
});

logoutBtn.addEventListener('click', () => {
  setToken('');
  localStorage.removeItem('role');
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
    const card = el('div', 'config-card');
    const icon = el('span', 'material-icons', 'error');
    const wrap = el('div');
    wrap.appendChild(el('h4', null, 'Erro'));
    wrap.appendChild(el('p', 'output', error));
    card.appendChild(icon);
    card.appendChild(wrap);
    configContainer.appendChild(card);
    return;
  }

  const hasRule = data && data.desconto_qtd_concluidos && data.desconto_valor_centavos;
  if (!hasRule) {
    const card = el('div', 'config-card');
    const icon = el('span', 'material-icons', 'info');
    const wrap = el('div');
    wrap.appendChild(el('h4', null, 'Sem regra ativa'));
    wrap.appendChild(el('p', 'output', 'Crie uma regra de desconto para começar.'));
    card.appendChild(icon);
    card.appendChild(wrap);
    configContainer.appendChild(card);
    return;
  }

  const card = el('div', 'config-card');
  const icon = el('span', 'material-icons', 'verified');
  const wrap = el('div');
  wrap.appendChild(el('h4', null, 'Regra Atual'));
  wrap.appendChild(el('p', 'output', `${data.desconto_qtd_concluidos} concluídos → ${formatCurrency(data.desconto_valor_centavos)} de desconto`));
  const actions = el('div', 'config-actions');
  const editBtn = el('button', 'btn ghost', 'Editar');
  const removeBtn = el('button', 'btn danger', 'Remover');
  actions.appendChild(editBtn);
  actions.appendChild(removeBtn);
  wrap.appendChild(actions);
  card.appendChild(icon);
  card.appendChild(wrap);
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
  const container = el('div');
  const grid = el('div', 'form-grid');

  const groupQtd = el('div', 'form-group');
  groupQtd.appendChild(el('label', null, 'Quantidade de concluídos'));
  const inputQtd = el('input');
  inputQtd.type = 'number';
  inputQtd.min = '1';
  if (data?.desconto_qtd_concluidos) inputQtd.value = data.desconto_qtd_concluidos;
  groupQtd.appendChild(inputQtd);

  const groupValor = el('div', 'form-group');
  groupValor.appendChild(el('label', null, 'Desconto (R$)'));
  const inputValor = el('input');
  inputValor.type = 'number';
  inputValor.min = '1';
  inputValor.step = '0.01';
  if (data?.desconto_valor_centavos) inputValor.value = (data.desconto_valor_centavos / 100).toFixed(2);
  groupValor.appendChild(inputValor);

  grid.appendChild(groupQtd);
  grid.appendChild(groupValor);

  const actions = el('div', 'modal-actions center');
  const saveBtn = el('button', 'btn primary', 'Salvar');
  actions.appendChild(saveBtn);

  container.appendChild(grid);
  container.appendChild(actions);

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

btnConfigCreate.addEventListener('click', () => openConfigModal(null));

loadClientesBtn.addEventListener('click', () => withButtonLock(loadClientesBtn, async () => {
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
    clear(clientesList);
    clientesList.appendChild(el('div', 'status', err.message));
  }
}));

buscarClientesBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  loadClientesBtn.click();
});

function renderClientes(clientes) {
  clear(clientesList);
  if (!clientes.length) {
    clientesList.appendChild(el('div', 'status', 'Sem clientes.'));
    return;
  }

  clientes.forEach(c => {
    const card = el('div', 'card');
    card.appendChild(el('strong', null, c.nome));
    card.appendChild(el('small', null, c.email));
    card.appendChild(el('small', null, `Status: ${c.ativo === 1 ? 'Ativo' : 'Desativado'}`));
    card.appendChild(el('small', null, `Concluídos: ${c.concluidos_count || 0}`));
    card.appendChild(el('small', null, `Desconto: ${formatCurrency(c.desconto_disponivel_centavos || 0)}`));

    const actions = el('div', 'card-actions');
    const editBtn = el('button', 'btn ghost', 'Editar');
    const toggleBtn = el('button', `btn ${c.ativo === 1 ? 'danger' : ''}`, c.ativo === 1 ? 'Desativar' : 'Ativar');
    actions.appendChild(editBtn);
    actions.appendChild(toggleBtn);
    card.appendChild(actions);

    editBtn.addEventListener('click', () => editarCliente(c));
    toggleBtn.addEventListener('click', () => withButtonLock(toggleBtn, () => toggleCliente(c.id, c.ativo)));

    clientesList.appendChild(card);
  });
}

function editarCliente(cliente) {
  const container = el('div');
  const grid = el('div', 'form-grid');

  const nameGroup = el('div', 'form-group');
  nameGroup.appendChild(el('label', null, 'Nome'));
  const nameInput = el('input');
  nameInput.value = cliente.nome || '';
  nameGroup.appendChild(nameInput);

  const emailGroup = el('div', 'form-group');
  emailGroup.appendChild(el('label', null, 'Email'));
  const emailInput = el('input');
  emailInput.value = cliente.email || '';
  emailGroup.appendChild(emailInput);

  const telGroup = el('div', 'form-group');
  telGroup.appendChild(el('label', null, 'Telefone'));
  const telInput = el('input');
  telInput.value = cliente.telefone || '';
  telGroup.appendChild(telInput);

  const ativoGroup = el('div', 'form-group');
  ativoGroup.appendChild(el('label', null, 'Ativo'));
  const ativoSelect = el('select');
  const optAtivo = el('option', null, 'Ativo');
  optAtivo.value = '1';
  const optInativo = el('option', null, 'Inativo');
  optInativo.value = '0';
  if (cliente.ativo === 1) optAtivo.selected = true; else optInativo.selected = true;
  ativoSelect.appendChild(optAtivo);
  ativoSelect.appendChild(optInativo);
  ativoGroup.appendChild(ativoSelect);

  grid.appendChild(nameGroup);
  grid.appendChild(emailGroup);
  grid.appendChild(telGroup);
  grid.appendChild(ativoGroup);

  const saveBtn = el('button', 'btn primary', 'Salvar');

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

loadAgendamentosBtn.addEventListener('click', () => withButtonLock(loadAgendamentosBtn, async () => {
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
        const inicioLocal = inicio.toLocaleDateString('en-CA');
        if (inicioLocal !== dataFiltro) return false;
      }
      if (!termo) return true;
      const clienteNome = (a.cliente?.nome || a.cliente_nome || a.clienteName || '').toLowerCase();
      return clienteNome.includes(termo);
    });
    renderAgendamentos(filtrados);
  } catch (err) {
    clear(agendamentosList);
    agendamentosList.appendChild(el('div', 'status', err.message));
  }
}));

buscarAgendamentosBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  loadAgendamentosBtn.click();
});

function renderAgendamentos(items) {
  clear(agendamentosList);
  if (!items.length) {
    agendamentosList.appendChild(el('div', 'status', 'Sem agendamentos.'));
    return;
  }

  items.forEach(a => {
    const clienteNome =
      a.cliente?.nome ||
      a.cliente_nome ||
      a.clienteName ||
      (a.cliente_id ? `#${a.cliente_id}` : '—');
    const card = el('div', 'card');
    card.appendChild(el('strong', null, `#${a.id} - ${a.status}`));
    card.appendChild(el('small', null, `Cliente: ${clienteNome}`));
    card.appendChild(el('small', null, `Barbeiro: ${a.barbeiro?.nome_profissional || a.barbeiro_id}`));
    card.appendChild(el('small', null, `Início: ${new Date(a.inicio).toLocaleString('pt-BR')}`));
    card.appendChild(el('small', null, `Valor: ${formatCurrency(a.valor_total_centavos)}`));
    if (a.pagamento_tipo) {
      card.appendChild(el('small', null, `Pagamento: ${a.pagamento_tipo}`));
    }

    const actions = el('div', 'card-actions');
    const detailsBtn = el('button', 'btn ghost', 'Detalhes');
    const concludeBtn = el('button', 'btn primary', 'Concluir');
    const cancelBtn = el('button', 'btn danger', 'Cancelar');
    actions.appendChild(detailsBtn);
    actions.appendChild(concludeBtn);
    actions.appendChild(cancelBtn);
    card.appendChild(actions);

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

    agendamentosList.appendChild(card);
  });
}

function verDetalhes(agendamento) {
  const container = el('div');
  const grid = el('div', 'details-grid');

  const clienteNome =
    agendamento.cliente?.nome ||
    agendamento.cliente_nome ||
    agendamento.clienteName ||
    (agendamento.cliente_id ? `#${agendamento.cliente_id}` : '—');

  grid.appendChild(el('p', null, `Status: ${agendamento.status}`));
  grid.appendChild(el('p', null, `Cliente: ${clienteNome}`));
  grid.appendChild(el('p', null, `Barbeiro: ${agendamento.barbeiro?.nome_profissional || agendamento.barbeiro_id}`));
  grid.appendChild(el('p', null, `Início: ${new Date(agendamento.inicio).toLocaleString('pt-BR')}`));
  grid.appendChild(el('p', null, `Fim: ${new Date(agendamento.fim).toLocaleString('pt-BR')}`));
  grid.appendChild(el('p', null, `Preço original: ${formatCurrency(agendamento.valor_original_centavos)}`));
  grid.appendChild(el('p', null, `Desconto: ${formatCurrency(agendamento.desconto_aplicado_centavos)}`));
  grid.appendChild(el('p', null, `Final: ${formatCurrency(agendamento.valor_total_centavos)}`));
  if (agendamento.pagamento_tipo) {
    grid.appendChild(el('p', null, `Pagamento: ${agendamento.pagamento_tipo}`));
  }

  const columns = el('div', 'details-columns');

  const servicosBox = el('div', 'details-box');
  servicosBox.appendChild(el('strong', null, 'Serviços'));
  const servicosList = el('ul');
  (agendamento.servicos || []).forEach(s => {
    servicosList.appendChild(el('li', null, `${s.nome} (${s.duracao_minutos} min)`));
  });
  if (!agendamento.servicos || agendamento.servicos.length === 0) {
    servicosList.appendChild(el('li', null, 'Sem serviços'));
  }
  servicosBox.appendChild(servicosList);

  const vagasBox = el('div', 'details-box');
  vagasBox.appendChild(el('strong', null, 'Vagas'));
  const vagasUl = el('ul');
  (agendamento.vagas || []).forEach(v => {
    vagasUl.appendChild(el('li', null, `${new Date(v.inicio).toLocaleString('pt-BR')} - ${v.status}`));
  });
  if (!agendamento.vagas || agendamento.vagas.length === 0) {
    vagasUl.appendChild(el('li', null, 'Sem vagas'));
  }
  vagasBox.appendChild(vagasUl);

  columns.appendChild(servicosBox);
  columns.appendChild(vagasBox);

  container.appendChild(grid);
  container.appendChild(columns);

  openModal(`Agendamento #${agendamento.id}`, container);
}

function abrirConcluirAgendamento(id) {
  const container = el('div');
  const grid = el('div', 'form-grid');

  const g1 = el('div', 'form-group');
  g1.appendChild(el('label', null, 'Forma de pagamento'));
  const select = el('select');
  ['DINHEIRO', 'PIX', 'CARTAO'].forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    select.appendChild(o);
  });
  g1.appendChild(select);
  grid.appendChild(g1);

  const confirmBtn = el('button', 'btn', 'Concluir');
  container.appendChild(grid);
  container.appendChild(confirmBtn);

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
      clear(vagasList);
      vagasList.appendChild(el('div', 'status', err.message));
    }
  });
});

function renderVagas(vagas) {
  clear(vagasList);
  if (!vagas.length) {
    vagasList.appendChild(el('div', 'status', 'Sem vagas.'));
    return;
  }

  vagas.forEach(v => {
    const card = el('div', 'card');
    card.appendChild(el('strong', null, `#${v.id} - ${v.status}`));
    card.appendChild(el('small', null, `Início: ${new Date(v.inicio).toLocaleString('pt-BR')}`));
    card.appendChild(el('small', null, `Fim: ${new Date(v.fim).toLocaleString('pt-BR')}`));
    const actions = el('div', 'card-actions');
    const blockBtn = el('button', 'btn ghost', 'Bloquear');
    const deleteBtn = el('button', 'btn danger', 'Apagar');
    actions.appendChild(blockBtn);
    actions.appendChild(deleteBtn);
    card.appendChild(actions);

    blockBtn.addEventListener('click', () => abrirBloqueioVaga(v.barbeiro_id || 0, v.inicio));
    deleteBtn.addEventListener('click', () => withButtonLock(deleteBtn, () => apagarVaga(v.id)));

    vagasList.appendChild(card);
  });
}

btnAbrirGerar.addEventListener('click', () => {
  const container = el('div');
  const grid = el('div', 'form-grid');

  const g1 = el('div', 'form-group');
  g1.appendChild(el('label', null, 'Barbeiro'));
  const s1 = el('select', 'barbeiro-select');
  populateBarbeiroSelect(s1);
  g1.appendChild(s1);

  const g2 = el('div', 'form-group');
  g2.appendChild(el('label', null, 'Data'));
  const d2 = el('input');
  d2.type = 'date';
  g2.appendChild(d2);

  const g3 = el('div', 'form-group');
  g3.appendChild(el('label', null, 'Início expediente'));
  const t3 = el('input');
  t3.type = 'time';
  t3.step = '60';
  g3.appendChild(t3);

  const g4 = el('div', 'form-group');
  g4.appendChild(el('label', null, 'Fim expediente'));
  const t4 = el('input');
  t4.type = 'time';
  t4.step = '60';
  g4.appendChild(t4);

  const g5 = el('div', 'form-group');
  g5.appendChild(el('label', null, 'Duração (min)'));
  const d5 = el('input');
  d5.type = 'number';
  d5.min = '5';
  d5.value = '30';
  g5.appendChild(d5);

  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);
  grid.appendChild(g5);

  const confirmBtn = el('button', 'btn', 'Gerar');

  container.appendChild(grid);
  container.appendChild(confirmBtn);

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

btnAbrirBloqueio.addEventListener('click', () => {
  const container = el('div');
  const grid = el('div', 'form-grid');

  const g1 = el('div', 'form-group');
  g1.appendChild(el('label', null, 'Barbeiro'));
  const s1 = el('select', 'barbeiro-select');
  populateBarbeiroSelect(s1);
  g1.appendChild(s1);

  const g2 = el('div', 'form-group');
  g2.appendChild(el('label', null, 'Data'));
  const d2 = el('input');
  d2.type = 'date';
  g2.appendChild(d2);

  const g3 = el('div', 'form-group');
  g3.appendChild(el('label', null, 'Início'));
  const t3 = el('input');
  t3.type = 'time';
  t3.step = '60';
  g3.appendChild(t3);

  const g4 = el('div', 'form-group');
  g4.appendChild(el('label', null, 'Fim'));
  const t4 = el('input');
  t4.type = 'time';
  t4.step = '60';
  g4.appendChild(t4);

  const g5 = el('div', 'form-group');
  g5.appendChild(el('label', null, 'Motivo'));
  const t5 = el('input');
  g5.appendChild(t5);

  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);
  grid.appendChild(g5);

  const confirmBtn = el('button', 'btn', 'Bloquear');

  container.appendChild(grid);
  container.appendChild(confirmBtn);

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

btnAbrirReserva.addEventListener('click', () => {
  const container = el('div');
  const grid = el('div', 'form-grid');

  const g1 = el('div', 'form-group');
  g1.appendChild(el('label', null, 'Barbeiro'));
  const s1 = el('select', 'barbeiro-select');
  populateBarbeiroSelect(s1);
  g1.appendChild(s1);

  const g2 = el('div', 'form-group');
  g2.appendChild(el('label', null, 'Data'));
  const d2 = el('input');
  d2.type = 'date';
  g2.appendChild(d2);

  const g3 = el('div', 'form-group');
  g3.appendChild(el('label', null, 'Hora'));
  const t3 = el('input');
  t3.type = 'time';
  t3.step = '60';
  g3.appendChild(t3);

  const g4 = el('div', 'form-group');
  g4.appendChild(el('label', null, 'Duração (min)'));
  const d4 = el('input');
  d4.type = 'number';
  d4.min = '5';
  d4.value = '30';
  g4.appendChild(d4);

  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);

  const confirmBtn = el('button', 'btn', 'Reservar');

  container.appendChild(grid);
  container.appendChild(confirmBtn);

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

  const container = el('div');
  const grid = el('div', 'form-grid');

  const g1 = el('div', 'form-group');
  g1.appendChild(el('label', null, 'Barbeiro'));
  const s1 = el('select', 'barbeiro-select');
  populateBarbeiroSelect(s1, barbeiroId);
  g1.appendChild(s1);

  const g2 = el('div', 'form-group');
  g2.appendChild(el('label', null, 'Data'));
  const d2 = el('input');
  d2.type = 'date';
  d2.value = data;
  g2.appendChild(d2);

  const g3 = el('div', 'form-group');
  g3.appendChild(el('label', null, 'Início'));
  const t3 = el('input');
  t3.type = 'time';
  t3.value = hora;
  g3.appendChild(t3);

  const g4 = el('div', 'form-group');
  g4.appendChild(el('label', null, 'Fim'));
  const t4 = el('input');
  t4.type = 'time';
  t4.value = hora;
  g4.appendChild(t4);

  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);

  const confirmBtn = el('button', 'btn', 'Bloquear');

  container.appendChild(grid);
  container.appendChild(confirmBtn);

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

loadServicosBtn.addEventListener('click', () => withButtonLock(loadServicosBtn, async () => {
  try {
    const data = await request('/servicos');
    renderServicos(data);
  } catch (err) {
    clear(servicosList);
    servicosList.appendChild(el('div', 'status', err.message));
  }
}));

btnNovoServico.addEventListener('click', () => {
  const container = el('div');
  const grid = el('div', 'form-grid');

  const g0 = el('div', 'form-group');
  g0.appendChild(el('label', null, 'Barbeiro'));
  const s0 = el('select', 'barbeiro-select');
  populateBarbeiroSelect(s0);
  g0.appendChild(s0);

  const g1 = el('div', 'form-group');
  g1.appendChild(el('label', null, 'Nome'));
  const i1 = el('input');
  g1.appendChild(i1);

  const g2 = el('div', 'form-group');
  g2.appendChild(el('label', null, 'Descrição'));
  const i2 = el('input');
  g2.appendChild(i2);

  const g3 = el('div', 'form-group');
  g3.appendChild(el('label', null, 'Duração (min)'));
  const i3 = el('input');
  i3.type = 'number';
  i3.min = '1';
  g3.appendChild(i3);

  const g4 = el('div', 'form-group');
  g4.appendChild(el('label', null, 'Preço (centavos)'));
  const i4 = el('input');
  i4.type = 'number';
  i4.min = '0';
  g4.appendChild(i4);

  grid.appendChild(g0);
  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);
  grid.appendChild(g4);

  const saveBtn = el('button', 'btn', 'Registrar');

  container.appendChild(grid);
  container.appendChild(saveBtn);

  openModal('Registrar serviço', container);

  saveBtn.addEventListener('click', () => withButtonLock(saveBtn, async () => {
    try {
      const payload = {
        barbeiro_id: Number(s0.value),
        nome: i1.value,
        descricao: i2.value,
        duracao_minutos: Number(i3.value),
        preco_centavos: Number(i4.value)
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
  clear(servicosList);
  if (!items.length) {
    servicosList.appendChild(el('div', 'status', 'Sem serviços.'));
    return;
  }

  items.forEach(s => {
    const card = el('div', 'card');
    card.dataset.id = String(s.id);

    const media = el('div', 'service-media');
    if (s.foto_url) {
      const img = document.createElement('img');
      img.src = s.foto_url;
      img.alt = s.nome;
      img.onerror = () => {
        media.innerHTML = '';
        media.appendChild(el('span', 'material-icons', 'image'));
      };
      media.appendChild(img);
    } else {
      media.appendChild(el('span', 'material-icons', 'image'));
    }

    card.appendChild(media);
    card.appendChild(el('strong', null, s.nome));
    card.appendChild(el('small', null, s.descricao || '-'));
    card.appendChild(el('small', null, `Barbeiro: ${getBarbeiroNomeById(s.barbeiro_id)}`));
    card.appendChild(el('small', null, `Duração: ${s.duracao_minutos} min`));
    card.appendChild(el('small', null, `Preço: ${formatCurrency(s.preco_centavos)}`));

    const actions = el('div', 'card-actions');
    const editBtn = el('button', 'btn ghost', 'Editar');
    const toggleBtn = el('button', `btn ${s.ativo === 1 ? 'danger' : ''}`, s.ativo === 1 ? 'Desativar' : 'Ativar');
    actions.appendChild(editBtn);
    actions.appendChild(toggleBtn);
    card.appendChild(actions);

    editBtn.addEventListener('click', () => editarServico(s));
    toggleBtn.addEventListener('click', () => withButtonLock(toggleBtn, () => toggleServico(s.id, s.ativo)));

    servicosList.appendChild(card);
  });
}

function editarServico(servico) {
  const container = el('div');
  container.classList.add('modal-form', 'service-modal');
  const grid = el('div', 'form-grid service-form');

  const fotoGroup = el('div', 'form-group photo-group');
  fotoGroup.appendChild(el('label', null, 'Imagem'));
  const preview = el('div', 'preview-avatar');
  const previewIcon = el('span', 'material-icons', 'image');
  if (servico.foto_url) {
    const img = document.createElement('img');
    img.src = servico.foto_url;
    img.alt = servico.nome;
    img.onerror = () => {
      preview.replaceChildren(previewIcon);
    };
    preview.appendChild(img);
  } else {
    preview.appendChild(previewIcon);
  }
  const fotoRow = el('div', 'photo-actions');
  const fotoInput = el('input', 'hidden-file');
  fotoInput.type = 'file';
  fotoInput.accept = 'image/*';
  const fotoBtn = el('button', 'btn ghost', 'Trocar imagem');
  const removeBtn = el('button', 'btn danger', 'Remover imagem');
  fotoRow.appendChild(fotoBtn);
  fotoRow.appendChild(removeBtn);
  fotoRow.appendChild(fotoInput);
  fotoGroup.appendChild(preview);
  fotoGroup.appendChild(fotoRow);

  const g0 = el('div', 'form-group');
  g0.appendChild(el('label', null, 'Barbeiro'));
  const s0 = el('select', 'barbeiro-select');
  populateBarbeiroSelect(s0, servico.barbeiro_id);
  g0.appendChild(s0);

  const g1 = el('div', 'form-group');
  g1.appendChild(el('label', null, 'Nome'));
  const i1 = el('input');
  i1.value = servico.nome || '';
  g1.appendChild(i1);

  const g2 = el('div', 'form-group');
  g2.appendChild(el('label', null, 'Descrição'));
  const i2 = el('input');
  i2.value = servico.descricao || '';
  g2.appendChild(i2);

  const g3 = el('div', 'form-group');
  g3.appendChild(el('label', null, 'Duração'));
  const i3 = el('input');
  i3.type = 'number';
  i3.value = servico.duracao_minutos;
  g3.appendChild(i3);

  const g4 = el('div', 'form-group');
  g4.appendChild(el('label', null, 'Preço (centavos)'));
  const i4 = el('input');
  i4.type = 'number';
  i4.value = servico.preco_centavos;
  g4.appendChild(i4);

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

  fotoBtn.addEventListener('click', () => fotoInput.click());
  if (!servico.foto_url) {
    removeBtn.disabled = true;
  }

  fotoInput.addEventListener('change', async () => {
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
      if (servico.foto_url) {
        const img = document.createElement('img');
        img.src = servico.foto_url;
        img.alt = servico.nome;
        img.onerror = () => {
          preview.replaceChildren(el('span', 'material-icons', 'image'));
        };
        preview.replaceChildren(img);
        removeBtn.disabled = false;
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

  removeBtn.addEventListener('click', () => withButtonLock(removeBtn, async () => {
    try {
      const updated = await request(`/servicos/${servico.id}/foto`, { method: 'DELETE' });
      servico.foto_url = updated?.foto_url || null;
      preview.replaceChildren(el('span', 'material-icons', 'image'));
      const cardMedia = document.querySelector(`.card[data-id="${servico.id}"] .service-media`);
      if (cardMedia) {
        cardMedia.replaceChildren(el('span', 'material-icons', 'image'));
      }
      removeBtn.disabled = true;
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
          preco_centavos: Number(i4.value)
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

loadBarbeirosBtn.addEventListener('click', () => withButtonLock(loadBarbeirosBtn, async () => {
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

btnNovoBarbeiro.addEventListener('click', () => {
  const container = el('div');
  const grid = el('div', 'form-grid');

  const g1 = el('div', 'form-group');
  g1.appendChild(el('label', null, 'Nome profissional'));
  const i1 = el('input');
  g1.appendChild(i1);

  const g2 = el('div', 'form-group');
  g2.appendChild(el('label', null, 'Bio'));
  const i2 = el('input');
  g2.appendChild(i2);

  grid.appendChild(g1);
  grid.appendChild(g2);

  const saveBtn = el('button', 'btn', 'Registrar');

  container.appendChild(grid);
  container.appendChild(saveBtn);

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
  clear(barbeirosList);
  if (!items.length) {
    barbeirosList.appendChild(el('div', 'status', 'Sem barbeiros.'));
    return;
  }

  items.forEach(b => {
    const card = el('div', 'card');
    const header = el('div', 'card-header vertical');
    const avatar = el('div', 'avatar avatar-large');
    if (b.foto_url) {
      const img = el('img');
      img.src = b.foto_url;
      img.alt = b.nome_profissional || 'Barbeiro';
      img.onerror = () => {
        img.remove();
        avatar.appendChild(el('span', 'material-icons', 'person'));
      };
      avatar.appendChild(img);
    } else {
      avatar.appendChild(el('span', 'material-icons', 'person'));
    }
    const titleBox = el('div', 'card-title');
    titleBox.appendChild(el('strong', null, b.nome_profissional));
    titleBox.appendChild(el('small', null, b.bio || '-'));
    header.appendChild(avatar);
    header.appendChild(titleBox);
    card.appendChild(header);
    card.appendChild(el('small', null, `Status: ${b.ativo === 1 ? 'Ativo' : 'Desativado'}`));

    const actions = el('div', 'card-actions');
    const editBtn = el('button', 'btn ghost', 'Editar');
    const toggleBtn = el('button', `btn ${b.ativo === 1 ? 'danger' : ''}`, b.ativo === 1 ? 'Desativar' : 'Ativar');
    actions.appendChild(editBtn);
    actions.appendChild(toggleBtn);
    card.appendChild(actions);

    editBtn.addEventListener('click', () => editarBarbeiro(b));
    toggleBtn.addEventListener('click', () => withButtonLock(toggleBtn, () => toggleBarbeiro(b.id, b.ativo)));

    barbeirosList.appendChild(card);
  });
}

function editarBarbeiro(barbeiro) {
  const container = el('div');
  container.classList.add('modal-form', 'barbeiro-modal');
  const grid = el('div', 'form-grid barber-form');

  const g1 = el('div', 'form-group');
  g1.appendChild(el('label', null, 'Nome'));
  const i1 = el('input');
  i1.value = barbeiro.nome_profissional || '';
  g1.appendChild(i1);

  const g2 = el('div', 'form-group');
  g2.appendChild(el('label', null, 'Bio'));
  const i2 = el('input');
  i2.value = barbeiro.bio || '';
  g2.appendChild(i2);

  const g3 = el('div', 'form-group');
  g3.appendChild(el('label', null, 'Ativo'));
  const s1 = el('select');
  const optA = el('option', null, 'Ativo');
  optA.value = '1';
  const optI = el('option', null, 'Inativo');
  optI.value = '0';
  if (barbeiro.ativo === 1) optA.selected = true; else optI.selected = true;
  s1.appendChild(optA);
  s1.appendChild(optI);
  g3.appendChild(s1);

  const fotoGroup = el('div', 'form-group photo-group');
  fotoGroup.appendChild(el('label', null, 'Foto'));
  const preview = el('div', 'avatar preview-avatar');
  if (barbeiro.foto_url) {
    const img = el('img');
    img.src = barbeiro.foto_url;
    img.alt = barbeiro.nome_profissional || 'Barbeiro';
    img.onerror = () => {
      img.remove();
      preview.appendChild(el('span', 'material-icons', 'person'));
    };
    preview.appendChild(img);
  } else {
    preview.appendChild(el('span', 'material-icons', 'person'));
  }
  const fotoRow = el('div', 'photo-actions');
  const fotoInput = el('input', 'hidden-file');
  fotoInput.type = 'file';
  fotoInput.accept = 'image/*';
  const fotoBtn = el('button', 'btn ghost', 'Trocar foto');
  const removeBtn = el('button', 'btn danger', 'Remover foto');
  fotoRow.appendChild(fotoBtn);
  fotoRow.appendChild(removeBtn);
  fotoRow.appendChild(fotoInput);
  fotoGroup.appendChild(preview);
  fotoGroup.appendChild(fotoRow);

  grid.appendChild(fotoGroup);
  grid.appendChild(g1);
  grid.appendChild(g2);
  grid.appendChild(g3);

  const saveBtn = el('button', 'btn primary', 'Salvar');
  const actions = el('div', 'modal-actions center');
  actions.appendChild(saveBtn);
  container.appendChild(grid);
  container.appendChild(actions);

  openModal('Editar Barbeiro', container);

  fotoBtn.addEventListener('click', () => fotoInput.click());
  if (!barbeiro.foto_url) {
    removeBtn.disabled = true;
  }
  fotoInput.addEventListener('change', () => {
    const file = fotoInput.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      showToast(error, 'error');
      fotoInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      preview.replaceChildren();
      const img = el('img');
      img.src = String(reader.result);
      img.alt = barbeiro.nome_profissional || 'Barbeiro';
      preview.appendChild(img);
      removeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener('click', () => withButtonLock(removeBtn, async () => {
    try {
      await request(`/barbeiros/${barbeiro.id}/foto`, { method: 'DELETE' });
      barbeiro.foto_url = null;
      preview.replaceChildren();
      preview.appendChild(el('span', 'material-icons', 'person'));
      removeBtn.disabled = true;
      showToast('Foto removida.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }));

  saveBtn.addEventListener('click', () => withButtonLock(saveBtn, async () => {
    try {
      if (fotoInput.files && fotoInput.files[0]) {
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

// Auto-load lists on initial load
loadConfig();
loadClientesBtn.click();
loadServicosBtn.click();
loadBarbeirosBtn.click();
loadBarbeirosCache();
