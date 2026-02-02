(() => {
  const basePath = window.BASE_PATH || '';

  const getCookieValue = (name) => {
    return document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`))
      ?.split('=')[1];
  };

  const normalizeImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith(`${basePath}/`)) return url;
    if (url.startsWith('/images/')) return `${basePath}${url.replace('/images/', '/assets/images/')}`;
    if (url.startsWith('/assets/images/')) return `${basePath}${url}`;
    if (url.includes('/images/')) {
      const idx = url.indexOf('/images/');
      return `${basePath}${url.slice(idx).replace('/images/', '/assets/images/')}`;
    }
    if (url.includes('/assets/images/')) {
      const idx = url.indexOf('/assets/images/');
      return `${basePath}${url.slice(idx)}`;
    }
    return url;
  };

  window.APP_UTILS = {
    getCookieValue,
    normalizeImageUrl
  };
})();
