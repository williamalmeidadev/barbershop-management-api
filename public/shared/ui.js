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

  window.UI = {
    el,
    clear,
    formatCurrency,
    createButton,
    createIcon,
    createMedia,
    createCard,
    createModalController,
    toast,
    renderStatus,
    renderLoading
  };
})();
