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

  const createHeader = ({ navLinks = [] } = {}) => {
    const header = createEl('header', { className: 'main-header' });
    const container = createEl('div', { className: 'container header-container' });
    const logo = createEl('a', {
      className: 'logo',
      attrs: { href: `${basePath}/` || '/' }
    });
    const logoIcon = createEl('span', { className: 'material-icons', text: 'diversity_3' });
    const logoTitle = createEl('h1', { text: 'BarberMarket' });
    appendChildren(logo, [logoIcon, logoTitle]);

    const nav = createEl('nav', { attrs: { id: 'nav-menu' } });
    navLinks.forEach((link) => {
      const anchor = createEl('a', {
        className: link.className || 'nav-link',
        text: link.label,
        attrs: { href: link.href }
      });
      nav.appendChild(anchor);
    });

    appendChildren(container, [logo, nav]);
    header.appendChild(container);
    return header;
  };

  const createFooter = ({
    brand = 'BarberMarket',
    location = 'Brasil',
    note = '© 2026 BarberMarket. Todos os direitos reservados.'
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

  window.LAYOUT = {
    createEl,
    appendChildren,
    createHeader,
    createFooter,
    renderAuthPage
  };
})();
