(() => {
  const base = window.location.pathname.startsWith('/server08') ? '/server08' : '';
  window.BASE_PATH = base;
  if (!base) return;

  const prefixIfNeeded = (value) => {
    if (!value || !value.startsWith('/')) return value;
    if (value.startsWith(base + '/')) return value;
    return base + value;
  };

  const apply = () => {
    document.querySelectorAll('a[href^="/"]').forEach((el) => {
      const raw = el.getAttribute('href');
      el.setAttribute('href', prefixIfNeeded(raw));
    });

    document.querySelectorAll('link[rel="stylesheet"][href^="/"]').forEach((el) => {
      const raw = el.getAttribute('href');
      el.setAttribute('href', prefixIfNeeded(raw));
    });

    document.querySelectorAll('script[src^="/"]').forEach((el) => {
      const raw = el.getAttribute('src');
      el.setAttribute('src', prefixIfNeeded(raw));
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
