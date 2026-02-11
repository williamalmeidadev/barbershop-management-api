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

  const createInstagramIcon = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('icon-instagram');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-2.25a1.25 1.25 0 1 1-1.25-1.25 1.25 1.25 0 0 1 1.25 1.25z');
    svg.appendChild(path);
    return svg;
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

    const menuToggle = createEl('button', {
      className: 'menu-toggle',
      attrs: {
        'aria-label': 'Abrir menu',
        'aria-expanded': 'false',
        type: 'button'
      }
    });
    menuToggle.appendChild(createEl('span', { className: 'material-icons', text: 'menu' }));

    const nav = createEl('nav', { className: 'nav-collapsible' });
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

    const closeMenu = () => {
      nav.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      const icon = menuToggle.querySelector('.material-icons');
      if (icon) icon.textContent = 'menu';
      document.body.classList.remove('menu-open');
    };

    menuToggle.addEventListener('click', () => {
      const willOpen = !nav.classList.contains('active');
      nav.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(willOpen));
      const icon = menuToggle.querySelector('.material-icons');
      if (icon) icon.textContent = willOpen ? 'close' : 'menu';
      document.body.classList.toggle('menu-open', willOpen);
    });

    nav.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('a, button')) {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    appendChildren(container, [logo, menuToggle, nav]);
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
    const fb = createEl('a', { attrs: { href: 'https://www.facebook.com', target: '_blank', rel: 'noopener' } });
    fb.appendChild(createEl('span', { className: 'material-icons', text: 'facebook' }));
    const insta = createEl('a', { attrs: { href: 'https://www.instagram.com', target: '_blank', rel: 'noopener' } });
    insta.appendChild(createInstagramIcon());
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
      attrs: { id: 'menu-toggle', 'aria-label': 'Abrir menu', 'aria-expanded': 'false', type: 'button' }
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
    const navProfile = createEl('a', {
      className: 'nav-link hidden', // Hidden by default, shown by app logic
      text: 'Meu Perfil',
      attrs: { href: `${basePath}/profile`, id: 'nav-profile' }
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

    appendChildren(nav, [navHome, navAppointments, navProfile, navAbout, authAction, themeBtn]);

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
    const authLogo = createEl('div', { className: 'auth-form-logo' });
    const authLogoImg = createEl('img', {
      className: 'auth-form-logo-img',
      attrs: { src: `${basePath}/assets/logo.png`, alt: 'AlphaCuts' }
    });
    authLogo.appendChild(authLogoImg);

    const headerWrap = createEl('div', { className: 'auth-header' });
    if (title) headerWrap.appendChild(createEl('h3', { text: title }));
    if (subtitle) headerWrap.appendChild(createEl('p', { text: subtitle }));

    appendChildren(card, [authLogo, headerWrap, ...bodyNodes]);
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
        btn.appendChild(createEl('span', { className: 'nav-label', text: item.label }));
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
