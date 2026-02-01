(() => {
  const formatCurrency = (centavos) => {
    const value = Number(centavos || 0) / 100;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

  window.UI = { el, clear, formatCurrency };
})();
