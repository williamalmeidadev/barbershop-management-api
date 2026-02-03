(() => {
  const basePath = window.BASE_PATH || '';

  const buildUrl = (path = '') => `${basePath}${path}`;

  const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  };

  const getCookie = (name) => {
    return document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`))
      ?.split('=')[1];
  };

  const withAuth = (headers = {}) => {
    const token = getCookie('admin_token') || getCookie('client_token');
    return token ? { ...headers, Authorization: `Bearer ${decodeURIComponent(token)}` } : headers;
  };

  const json = async (path, options = {}) => {
    const headers = withAuth({
      'Content-Type': 'application/json',
      ...(options.headers || {})
    });
    const response = await fetch(buildUrl(path), { ...options, headers });
    const data = await parseResponse(response);
    if (!response.ok) {
      const message = data?.error || data?.message || 'Erro na requisição';
      throw new Error(message);
    }
    return data;
  };

  const form = async (path, formData, options = {}) => {
    const headers = withAuth(options.headers || {});
    const response = await fetch(buildUrl(path), {
      method: options.method || 'POST',
      body: formData,
      headers
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      const message = data?.error || data?.message || 'Erro na requisição';
      throw new Error(message);
    }
    return data;
  };

  window.API = { json, form, buildUrl };
})();
