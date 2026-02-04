(function () {
  const basePath = window.BASE_PATH || '';

  const createEl = (tag, { className, text, attrs } = {}) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (value !== undefined) el.setAttribute(key, value);
      });
    }
    return el;
  };

  const appendChildren = (parent, children = []) => {
    children.filter(Boolean).forEach((child) => parent.appendChild(child));
    return parent;
  };

  const createThemeToggle = () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light' || localStorage.getItem('theme') === 'light';

    const btn = createEl('button', {
      className: 'nav-button theme-toggle',
      attrs: {
        'aria-label': 'Alternar Tema',
        style: 'margin-left: 0.5rem; padding: 0.6rem; min-width: auto;'
      }
    });

    const updateIcon = () => {
      const currentIsLight = document.documentElement.getAttribute('data-theme') === 'light';
      btn.innerHTML = ''; // Clear
      const icon = createEl('span', {
        className: 'material-icons',
        text: currentIsLight ? 'dark_mode' : 'light_mode'
      });
      btn.appendChild(icon);
    };

    // Init
    if (localStorage.getItem('theme') === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    updateIcon();

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateIcon();
    });

    return btn;
  };

  const createHeader = ({ navLinks = [] } = {}) => {
    const header = createEl('header', { className: 'main-header' });
    const container = createEl('div', { className: 'container header-container' });
    const logo = createEl('a', {
      className: 'logo',
      attrs: { href: `${basePath}/` || '/' }
    });
    const logoImg = createEl('img', {
      className: 'logo-img',
      attrs: { src: `${basePath}/assets/logo.png`, alt: 'AlphaCuts' }
    });
    const logoTitle = createEl('h1', { text: 'AlphaCuts' });
    appendChildren(logo, [logoImg, logoTitle]);

    const nav = createEl('nav', { attrs: { id: 'nav-menu' } });
    navLinks.forEach((link) => {
      const anchor = createEl('a', {
        className: link.className || 'nav-link',
        text: link.label,
        attrs: { href: link.href }
      });
      nav.appendChild(anchor);
    });

    const themeBtn = createThemeToggle();
    nav.appendChild(themeBtn);

    appendChildren(container, [logo, nav]);
    header.appendChild(container);
    return header;
  };

  const createFooter = ({
    brand = 'AlphaCuts',
    location = 'Brasil',
    note = '© 2026 AlphaCuts. Todos os direitos reservados.'
  } = {}) => {
    const footer = createEl('footer', { className: 'main-footer' });
    const container = createEl('div', { className: 'container footer-content' });

    const info = createEl('div', { className: 'footer-info' });
    appendChildren(info, [createEl('h3', { text: brand }), createEl('p', { text: location })]);

    const social = createEl('div', { className: 'footer-social' });
    const fb = createEl('a', { attrs: { href: '#' } });
    fb.appendChild(createEl('span', { className: 'material-icons', text: 'facebook' }));
    const insta = createEl('a', { attrs: { href: '#' } });
    insta.appendChild(createEl('span', { className: 'material-icons', text: 'camera_alt' }));
    appendChildren(social, [fb, insta]);

    const bottom = createEl('div', { className: 'footer-bottom' });
    bottom.appendChild(createEl('p', { text: note }));

    appendChildren(container, [info, social, bottom]);
    footer.appendChild(container);
    return footer;
  };

  const createAppHeader = ({ basePath = '', showAppointments = true } = {}) => {
    const header = createEl('header', { className: 'main-header' });
    const container = createEl('div', { className: 'container header-container' });
    const logo = createEl('a', {
      className: 'logo',
      attrs: { href: `${basePath}/app` }
    });
    const logoImg = createEl('img', {
      className: 'logo-img',
      attrs: { src: `${basePath}/assets/logo.png`, alt: 'AlphaCuts' }
    });
    const logoTitle = createEl('h1', { text: 'AlphaCuts' });
    appendChildren(logo, [logoImg, logoTitle]);

    const menuToggle = createEl('button', {
      className: 'menu-toggle',
      attrs: { id: 'menu-toggle', 'aria-label': 'Abrir menu' }
    });
    menuToggle.appendChild(createEl('span', { className: 'material-icons', text: 'menu' }));

    const nav = createEl('nav', { attrs: { id: 'nav-menu' } });
    const navHome = createEl('a', {
      className: 'nav-link active',
      text: 'Explorar',
      attrs: { href: '#home', id: 'nav-home' }
    });
    const navAppointments = createEl('a', {
      className: `nav-link${showAppointments ? '' : ' hidden'}`,
      text: 'Meus Agendamentos',
      attrs: { href: '#appointments', id: 'nav-appointments' }
    });
    const navAbout = createEl('a', {
      className: 'nav-link',
      text: 'Sobre',
      attrs: { href: '#about', id: 'nav-about' }
    });
    const authAction = createEl('a', {
      className: 'nav-button',
      text: 'Login',
      attrs: { href: `${basePath}/login`, id: 'auth-action' }
    });

    const themeBtn = createThemeToggle();

    appendChildren(nav, [navHome, navAppointments, navAbout, authAction, themeBtn]);

    appendChildren(container, [logo, menuToggle, nav]);
    header.appendChild(container);
    return header;
  };

  const renderAuthPage = ({
    mountId = 'app',
    navLinks = [],
    title,
    subtitle,
    bodyNodes = [],
    footerNote,
    footerLocation,
    footerBrand
  } = {}) => {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    mount.replaceChildren();

    const header = createHeader({ navLinks });

    const main = createEl('main', { className: 'auth-page', attrs: { id: 'content' } });
    const section = createEl('section', { className: 'auth-hero auth-hero-simple' });
    const container = createEl('div', { className: 'container auth-shell auth-shell-single' });
    const panel = createEl('div', { className: 'auth-panel' });
    const card = createEl('div', { className: 'auth-card' });

    const headerWrap = createEl('div', { className: 'auth-header' });
    if (title) headerWrap.appendChild(createEl('h3', { text: title }));
    if (subtitle) headerWrap.appendChild(createEl('p', { text: subtitle }));

    appendChildren(card, [headerWrap, ...bodyNodes]);
    panel.appendChild(card);
    container.appendChild(panel);
    section.appendChild(container);
    main.appendChild(section);

    const footer = createFooter({
      brand: footerBrand,
      location: footerLocation,
      note: footerNote
    });

    appendChildren(mount, [header, main, footer]);
  };

  const createPanelHeader = ({ title, actions = [] } = {}) => {
    const header = createEl('div', { className: 'panel-header' });
    if (title) header.appendChild(createEl('h3', { text: title }));
    if (actions.length) {
      const group = createEl('div', { className: 'actions-group' });
      actions.forEach((action) => action && group.appendChild(action));
      header.appendChild(group);
    }
    return header;
  };

  const renderPanelHeader = (container, options = {}) => {
    if (!container) return;
    const header = createPanelHeader(options);
    container.replaceChildren(...header.childNodes);
  };

  window.LAYOUT = {
    createEl,
    appendChildren,
    createThemeToggle,
    createHeader,
    createFooter,
    createAppHeader,
    renderAuthPage,
    createPanelHeader,
    renderPanelHeader,
    createAdminSidebar: ({ onLogoutId = 'logout-btn' } = {}) => {
      const sidebar = createEl('aside', { className: 'sidebar' });
      const sidebarHeader = createEl('div', { className: 'sidebar-header' });
      const logoImg = createEl('img', {
        className: 'logo-img',
        attrs: { src: `${basePath}/assets/logo.png`, alt: 'AlphaCuts' }
      });
      sidebarHeader.appendChild(logoImg);
      sidebarHeader.appendChild(createEl('h1', { text: 'Admin' }));

      const nav = createEl('nav', { className: 'sidebar-nav' });
      const navItems = [
        { tab: 'config', icon: 'tune', label: 'Configurações', active: true },
        { tab: 'clientes', icon: 'people', label: 'Clientes' },
        { tab: 'agendamentos', icon: 'calendar_month', label: 'Agendamentos' },
        { tab: 'vagas', icon: 'event_available', label: 'Vagas' },
        { tab: 'servicos', icon: 'content_cut', label: 'Serviços' },
        { tab: 'barbeiros', icon: 'face', label: 'Barbeiros' }
      ];
      navItems.forEach((item) => {
        const btn = createEl('button', {
          className: `nav-item${item.active ? ' active' : ''}`,
          attrs: { 'data-tab': item.tab }
        });
        btn.appendChild(createEl('span', { className: 'material-icons', text: item.icon }));
        btn.appendChild(document.createTextNode(` ${item.label}`));
        nav.appendChild(btn);
      });

      const footer = createEl('div', { className: 'sidebar-footer' });
      const logoutBtn = createEl('button', { className: 'btn ghost-danger', attrs: { id: onLogoutId } });
      logoutBtn.appendChild(createEl('span', { className: 'material-icons', text: 'logout' }));
      logoutBtn.appendChild(document.createTextNode(' Sair'));
      footer.appendChild(logoutBtn);

      appendChildren(sidebar, [sidebarHeader, nav, footer]);
      return sidebar;
    },
    createAdminTopbar: () => {
      const topbar = createEl('header', { className: 'topbar' });
      const left = createEl('div', { className: 'topbar-title', text: 'Painel Administrativo' });
      const actions = createEl('div', { className: 'topbar-actions' });
      const themeBtn = createThemeToggle();
      actions.appendChild(themeBtn);
      appendChildren(topbar, [left, actions]);
      return topbar;
    },
    renderAdminPanelHeader: (container, { title, subtitle, actions } = {}) => {
      if (!container) return;
      container.replaceChildren();
      const textWrap = createEl('div');
      if (title) textWrap.appendChild(createEl('h2', { text: title }));
      if (subtitle) textWrap.appendChild(createEl('p', { text: subtitle }));
      container.appendChild(textWrap);
      if (actions) container.appendChild(actions);
    }
  };
})();
