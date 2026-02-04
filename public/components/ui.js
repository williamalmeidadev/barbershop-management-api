(() => {
  const formatCurrency = (centavos) => {
    const value = Number(centavos || 0) / 100;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const createButton = (label, className = 'btn') => {
    const btn = document.createElement('button');
    btn.className = className;
    btn.textContent = label;
    return btn;
  };

  const createIcon = (name, className = 'material-icons') => {
    const icon = document.createElement('span');
    icon.className = className;
    icon.textContent = name;
    return icon;
  };

  const createBadge = (text, className = 'badge') => {
    const badge = document.createElement('span');
    badge.className = className;
    badge.textContent = text;
    return badge;
  };

  const createMedia = ({ url, alt = '', icon = 'image', className = 'media', imgClass } = {}) => {
    const wrap = document.createElement('div');
    wrap.className = className;
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = alt;
      if (imgClass) img.className = imgClass;
      img.onerror = () => {
        wrap.replaceChildren(createIcon(icon));
      };
      wrap.appendChild(img);
      return wrap;
    }
    wrap.appendChild(createIcon(icon));
    return wrap;
  };

  const createCard = (className = 'card') => {
    const card = document.createElement('div');
    card.className = className;
    return card;
  };

  const createInfoList = (lines, tag = 'small') => {
    const frag = document.createDocumentFragment();
    (lines || []).forEach((text) => {
      const node = document.createElement(tag);
      node.textContent = text;
      frag.appendChild(node);
    });
    return frag;
  };

  const createActionsRow = (actions = [], className = 'card-actions') => {
    const row = document.createElement('div');
    row.className = className;
    actions.forEach((btn) => btn && row.appendChild(btn));
    return row;
  };

  const createActionButton = ({ id, label, className = 'btn', icon } = {}) => {
    const btn = createButton(label, className);
    if (id) btn.id = id;
    if (icon) btn.prepend(createIcon(icon));
    return btn;
  };

  const createCardWithLines = ({ title, lines = [], actions = [], className = 'card', titleTag = 'strong' }) => {
    const card = createCard(className);
    if (title) {
      const titleEl = document.createElement(titleTag);
      titleEl.textContent = title;
      card.appendChild(titleEl);
    }
    card.appendChild(createInfoList(lines));
    if (actions.length) {
      card.appendChild(createActionsRow(actions));
    }
    return card;
  };

  const createSectionHeader = (titleText, className = 'section-title') => {
    const header = document.createElement('h2');
    header.className = className;
    header.textContent = titleText;
    return header;
  };

  const createInfoRow = (label, value) => {
    const row = document.createElement('div');
    row.className = 'info-row';
    const l = document.createElement('strong');
    l.textContent = label;
    const v = document.createElement('span');
    v.textContent = value;
    row.appendChild(l);
    row.appendChild(v);
    return row;
  };

  const createCardWithHeader = ({
    title,
    icon,
    className = 'card',
    headerClass = 'card-header',
    titleClass = 'card-title',
    statusClass = 'card-status'
  } = {}) => {
    const card = createCard(className);
    const header = document.createElement('div');
    header.className = headerClass;

    const titleWrap = document.createElement('div');
    titleWrap.className = titleClass;
    if (icon) titleWrap.appendChild(createIcon(icon));
    if (title) {
      const titleEl = document.createElement('span');
      titleEl.textContent = title;
      titleWrap.appendChild(titleEl);
    }

    header.appendChild(titleWrap);

    card.appendChild(header);
    return { card, header, titleWrap };
  };

  const createInput = ({
    type = 'text',
    value,
    placeholder,
    min,
    max,
    step,
    className
  } = {}) => {
    const input = document.createElement('input');
    input.type = type;
    if (className) input.className = className;
    if (value !== undefined) input.value = value;
    if (placeholder) input.placeholder = placeholder;
    if (min !== undefined) input.min = String(min);
    if (max !== undefined) input.max = String(max);
    if (step !== undefined) input.step = String(step);
    return input;
  };

  const createSelect = ({ options = [], value, className } = {}) => {
    const select = document.createElement('select');
    if (className) select.className = className;
    options.forEach((opt) => {
      const option = document.createElement('option');
      option.value = String(opt.value);
      option.textContent = opt.label;
      if (value !== undefined && String(value) === String(opt.value)) option.selected = true;
      select.appendChild(option);
    });
    return select;
  };

  const createFormGroup = (labelText, fieldEl, className = 'form-group') => {
    const group = document.createElement('div');
    group.className = className;
    const label = document.createElement('label');
    label.textContent = labelText;
    group.appendChild(label);
    if (fieldEl) group.appendChild(fieldEl);
    return group;
  };

  const createPhotoGroup = ({
    label = 'Foto',
    icon = 'person',
    imageUrl,
    alt,
    onFileSelected,
    onRemove,
    removeLabel = 'Remover foto',
    changeLabel = 'Trocar foto',
    accept = 'image/*'
  } = {}) => {
    const group = document.createElement('div');
    group.className = 'form-group photo-group';
    group.appendChild(el('label', null, label));

    const preview = document.createElement('div');
    preview.className = 'avatar preview-avatar';
    const updatePreview = (url) => {
      preview.replaceChildren();
      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = alt || label;
        img.onerror = () => {
          preview.replaceChildren(createIcon(icon));
        };
        preview.appendChild(img);
      } else {
        preview.appendChild(createIcon(icon));
      }
    };
    updatePreview(imageUrl);

    const actions = document.createElement('div');
    actions.className = 'photo-actions';
    const fileInput = document.createElement('input');
    fileInput.className = 'hidden-file';
    fileInput.type = 'file';
    fileInput.accept = accept;

    const changeBtn = createButton(changeLabel, 'btn ghost');
    const removeBtn = createButton(removeLabel, 'btn danger');

    actions.appendChild(changeBtn);
    actions.appendChild(removeBtn);
    actions.appendChild(fileInput);

    changeBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      if (typeof onFileSelected === 'function') {
        onFileSelected({ file, updatePreview, input: fileInput, removeBtn });
      }
    });
    removeBtn.addEventListener('click', () => {
      if (typeof onRemove === 'function') {
        onRemove({ updatePreview, input: fileInput, removeBtn });
      }
    });

    group.appendChild(preview);
    group.appendChild(actions);

    return { group, preview, fileInput, changeBtn, removeBtn, updatePreview };
  };

  const createModalController = ({ modal, titleEl, bodyEl, closeEl }) => {
    if (!modal || !bodyEl) {
      return {
        open: () => {},
        close: () => {}
      };
    }

    const open = (title, contentNode) => {
      if (titleEl && title !== undefined) titleEl.textContent = title;
      clear(bodyEl);
      if (contentNode) bodyEl.appendChild(contentNode);
      modal.classList.remove('hidden');
    };

    const close = () => {
      modal.classList.add('hidden');
      clear(bodyEl);
    };

    if (closeEl) {
      closeEl.addEventListener('click', close);
    }
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    return { open, close };
  };

  const toast = (container, message, options = {}) => {
    if (!container) return;
    const { type = 'success', duration = 3500, classBase = 'toast' } = options;
    const note = document.createElement('div');
    note.className = `${classBase} ${type}`;
    note.textContent = message;
    container.appendChild(note);
    setTimeout(() => note.remove(), duration);
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const clear = (node) => {
    if (!node) return;
    node.replaceChildren();
  };

  const renderStatus = (container, message, className = 'status') => {
    if (!container) return;
    clear(container);
    const node = document.createElement('div');
    node.className = className;
    node.textContent = message;
    container.appendChild(node);
  };

  const renderLoading = (container, message = 'Carregando...') => {
    renderStatus(container, message, 'loading');
  };

  const renderCardList = (container, items, renderItem, { emptyMessage = 'Sem dados.' } = {}) => {
    if (!container) return;
    clear(container);
    if (!items || items.length === 0) {
      renderStatus(container, emptyMessage);
      return;
    }
    items.forEach((item) => {
      const node = renderItem(item);
      if (node) container.appendChild(node);
    });
  };

  window.UI = {
    el,
    clear,
    formatCurrency,
    createButton,
    createIcon,
    createBadge,
    createMedia,
    createCard,
    createInfoList,
    createActionsRow,
    createActionButton,
    createCardWithLines,
    createSectionHeader,
    createInfoRow,
    createCardWithHeader,
    createInput,
    createSelect,
    createFormGroup,
    createPhotoGroup,
    createModalController,
    toast,
    renderStatus,
    renderLoading,
    renderCardList
  };
})();
