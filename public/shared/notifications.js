(() => {
  const ui = window.UI || {};
  const toast = ui.toast;

  const notify = (message, type = 'success', options = {}) => {
    const containerId = options.containerId || 'notification-container';
    const container = document.getElementById(containerId);
    if (toast) {
      toast(container, message, {
        type,
        classBase: options.classBase || 'notification',
        duration: options.duration || 3000
      });
      return;
    }
    if (!container) return;
    const note = document.createElement('div');
    note.className = `${options.classBase || 'notification'} ${type}`;
    note.textContent = message;
    container.appendChild(note);
    note.classList.add('fade-in');
    setTimeout(() => {
      note.classList.add('fade-out');
      setTimeout(() => note.remove(), 300);
    }, options.duration || 3000);
  };

  window.NOTIFY = { notify };
})();
