(function () {
  const ui = window.UI || {};
  const createCard = ui.createCard;
  const createMedia = ui.createMedia;
  const createCardWithLines = ui.createCardWithLines;
  const createActionsRow = ui.createActionsRow;
  const createButton = ui.createButton;

  if (!createCard || !createCardWithLines || !createActionsRow) return;

  const createConfigCard = ({ title, message, icon = 'info', actions = [] } = {}) => {
    const card = document.createElement('div');
    card.className = 'config-card';
    const iconEl = document.createElement('span');
    iconEl.className = 'material-icons';
    iconEl.textContent = icon;
    const wrap = document.createElement('div');
    wrap.appendChild(document.createElement('h4')).textContent = title || '';
    const msg = document.createElement('p');
    msg.className = 'output';
    msg.textContent = message || '';
    wrap.appendChild(msg);
    if (actions.length) {
      const actionsRow = document.createElement('div');
      actionsRow.className = 'config-actions';
      actions.forEach((btn) => btn && actionsRow.appendChild(btn));
      wrap.appendChild(actionsRow);
    }
    card.appendChild(iconEl);
    card.appendChild(wrap);
    return card;
  };

  const createServiceCard = ({ id, name, description, duration, priceText, barbeiroNome, mediaUrl, onEdit, onToggle, onDelete, ativo } = {}) => {
    const actions = [];
    if (onEdit) actions.push(createButton('Editar', 'btn ghost'));
    if (onToggle) actions.push(createButton(ativo === 1 ? 'Desativar' : 'Ativar', `btn ${ativo === 1 ? 'danger' : ''}`));
    if (onDelete) actions.push(createButton('Apagar', 'btn danger'));
    const card = createCardWithLines({
      title: name,
      lines: [
        description || '-',
        barbeiroNome ? `Barbeiro: ${barbeiroNome}` : '',
        duration ? `Duração: ${duration} min` : '',
        priceText ? `Preço: ${priceText}` : ''
      ].filter(Boolean),
      actions
    });
    if (id) card.dataset.id = String(id);
    if (mediaUrl && createMedia) {
      const media = createMedia({
        url: mediaUrl,
        alt: name || 'Serviço',
        icon: 'image',
        className: 'service-media'
      });
      card.insertBefore(media, card.firstChild);
    }
    const [editBtn, toggleBtn, deleteBtn] = actions;
    if (onEdit && editBtn) editBtn.addEventListener('click', () => onEdit(editBtn));
    if (onToggle && toggleBtn) toggleBtn.addEventListener('click', () => onToggle(toggleBtn));
    if (onDelete && deleteBtn) deleteBtn.addEventListener('click', () => onDelete(deleteBtn));
    return card;
  };

  const createClienteCard = ({ nome, email, ativo, concluidos, desconto, onEdit, onToggle, onDelete } = {}) => {
    const actions = [];
    const editBtn = onEdit ? createButton('Editar', 'btn ghost') : null;
    const toggleBtn = onToggle ? createButton(ativo === 1 ? 'Desativar' : 'Ativar', `btn ${ativo === 1 ? 'danger' : ''}`) : null;
    const deleteBtn = onDelete ? createButton('Apagar', 'btn danger') : null;
    if (editBtn) actions.push(editBtn);
    if (toggleBtn) actions.push(toggleBtn);
    if (deleteBtn) actions.push(deleteBtn);
    const card = createCardWithLines({
      title: nome,
      lines: [
        email || '-',
        `Status: ${ativo === 1 ? 'Ativo' : 'Desativado'}`,
        `Concluídos: ${concluidos || 0}`,
        desconto ? `Desconto: ${desconto}` : 'Desconto: R$ 0,00'
      ],
      actions
    });
    if (onEdit && editBtn) editBtn.addEventListener('click', () => onEdit(editBtn));
    if (onToggle && toggleBtn) toggleBtn.addEventListener('click', () => onToggle(toggleBtn));
    if (onDelete && deleteBtn) deleteBtn.addEventListener('click', () => onDelete(deleteBtn));
    return card;
  };

  const createBarbeiroCard = ({ nome, bio, ativo, mediaUrl, onEdit, onToggle, onDelete } = {}) => {
    const card = createCard('card');
    const header = document.createElement('div');
    header.className = 'card-header vertical';
    if (createMedia) {
      const avatar = createMedia({
        url: mediaUrl,
        alt: nome || 'Barbeiro',
        icon: 'person',
        className: 'avatar avatar-large'
      });
      header.appendChild(avatar);
    }
    const titleBox = document.createElement('div');
    titleBox.className = 'card-title';
    const strong = document.createElement('strong');
    strong.textContent = nome || 'Barbeiro';
    const small = document.createElement('small');
    small.textContent = bio || '-';
    titleBox.appendChild(strong);
    titleBox.appendChild(small);
    header.appendChild(titleBox);
    card.appendChild(header);
    card.appendChild(document.createElement('small')).textContent = `Status: ${ativo === 1 ? 'Ativo' : 'Desativado'}`;

    const actions = [];
    if (onEdit) actions.push(createButton('Editar', 'btn ghost'));
    if (onToggle) actions.push(createButton(ativo === 1 ? 'Desativar' : 'Ativar', `btn ${ativo === 1 ? 'danger' : ''}`));
    if (onDelete) actions.push(createButton('Apagar', 'btn danger'));
    card.appendChild(createActionsRow(actions));
    const [editBtn, toggleBtn, deleteBtn] = actions;
    if (onEdit && editBtn) editBtn.addEventListener('click', () => onEdit(editBtn));
    if (onToggle && toggleBtn) toggleBtn.addEventListener('click', () => onToggle(toggleBtn));
    if (onDelete && deleteBtn) deleteBtn.addEventListener('click', () => onDelete(deleteBtn));
    return card;
  };

  const createAgendamentoCard = ({
    id,
    status,
    clientName,
    barberName,
    dateText,
    priceComponents = [], // Array of { label, value, isTotal}
    actions = []
  } = {}) => {
    const card = document.createElement('div');
    card.className = 'appointment-card';

    // Header
    const header = document.createElement('div');
    header.className = 'appointment-header';

    const title = document.createElement('strong');
    title.textContent = id ? `#${id}` : '';
    header.appendChild(title);

    const statusBadge = document.createElement('span');
    statusBadge.className = 'appointment-status';
    statusBadge.textContent = status || '';
    header.appendChild(statusBadge);

    card.appendChild(header);

    // Details (Client, Barber, Date)
    const details = document.createElement('div');
    details.className = 'appointment-details';

    const addDetail = (icon, text) => {
      const p = document.createElement('div');
      const i = document.createElement('span');
      i.className = 'material-icons';
      i.textContent = icon;
      p.appendChild(i);
      p.appendChild(document.createTextNode(text));
      details.appendChild(p);
    };

    if (clientName) addDetail('person', clientName);
    if (barberName) addDetail('content_cut', barberName);
    if (dateText) addDetail('event', dateText);

    card.appendChild(details);

    // Price
    if (priceComponents.length) {
      const priceBox = document.createElement('div');
      priceBox.className = 'appointment-price';

      priceComponents.forEach(({ label, value, isTotal }) => {
        const row = document.createElement('div');
        row.className = isTotal ? 'info-row appointment-total' : 'info-row';

        const l = document.createElement('strong');
        l.textContent = label;

        const v = document.createElement('span');
        v.textContent = value;

        row.appendChild(l);
        row.appendChild(v);
        priceBox.appendChild(row);
      });

      card.appendChild(priceBox);
    }

    // Actions
    if (actions.length) {
      const actionsRow = document.createElement('div');
      actionsRow.className = 'card-actions';
      actionsRow.style.marginTop = '1rem'; // Ensure separation
      actions.forEach(btn => btn && actionsRow.appendChild(btn));
      card.appendChild(actionsRow);
    }

    return card;
  };

  const createVagaCard = ({ id, status, lines = [], actions = [] } = {}) => {
    const title = id ? `#${id} - ${status || ''}` : status || '';
    return createCardWithLines({
      title,
      lines,
      actions
    });
  };

  window.ADMIN_CARDS = {
    createConfigCard,
    createServiceCard,
    createClienteCard,
    createBarbeiroCard,
    createAgendamentoCard,
    createVagaCard
  };
})();
