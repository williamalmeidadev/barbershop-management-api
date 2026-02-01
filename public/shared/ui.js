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

  const createCard = (className = 'card') => {
    const card = document.createElement('div');
    card.className = className;
    return card;
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

  window.UI = { el, clear, formatCurrency, createButton, createCard, toast };
})();
