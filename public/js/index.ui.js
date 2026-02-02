(function () {
  const basePath = window.BASE_PATH || '';
  const layout = window.LAYOUT || {};
  const { createEl, appendChildren, createFooter, createHeader } = layout;

  if (!createEl || !appendChildren || !createFooter || !createHeader) return;

  const appRoot = document.getElementById('app');
  if (!appRoot) return;
  appRoot.replaceChildren();

  const header = createHeader({
    navLinks: [
      { href: `${basePath}/login`, label: 'Entrar', className: 'nav-link' },
      { href: `${basePath}/register`, label: 'Cadastrar', className: 'nav-button' }
    ]
  });

  const main = createEl('main');
  const hero = createEl('section', { className: 'landing-hero' });
  const heroContainer = createEl('div', { className: 'container' });
  const heroTitle = createEl('h1', { className: 'hero-title', text: 'Seu Estilo,\nNo Seu Tempo.' });
  const heroDesc = createEl('p', {
    className: 'hero-description',
    text: 'O maior marketplace de barbearias da região. Encontre os melhores profissionais, compare preços e agende em segundos.'
  });
  const heroActions = createEl('div', { className: 'hero-actions' });
  const heroCta = createEl('a', { className: 'cta-button', text: 'Agendar Agora', attrs: { href: `${basePath}/app` } });
  const heroAdmin = createEl('a', { className: 'nav-button nav-button-hero', text: 'Sou Barbeiro', attrs: { href: `${basePath}/admin` } });
  appendChildren(heroActions, [heroCta, heroAdmin]);
  appendChildren(heroContainer, [heroTitle, heroDesc, heroActions]);
  hero.appendChild(heroContainer);

  const features = createEl('section', { className: 'section' });
  const featuresContainer = createEl('div', { className: 'container' });
  const featuresHeader = createEl('div', { className: 'text-center' });
  featuresHeader.appendChild(createEl('h2', { className: 'section-title', text: 'Por que usar o BarberMarket?' }));
  const grid = createEl('div', { className: 'features-grid' });
  const items = [
    {
      icon: 'calendar_month',
      title: 'Agendamento Fácil',
      text: 'Esqueça as ligações. Reserve seu horário em poucos cliques, 24 horas por dia.'
    },
    {
      icon: 'content_cut',
      title: 'Profissionais Top',
      text: 'Acesse os perfis, fotos e avaliações dos melhores barbeiros da cidade.'
    },
    {
      icon: 'notifications_active',
      title: 'Lembretes',
      text: 'Receba avisos automáticos para nunca mais perder a hora do seu corte.'
    }
  ];
  items.forEach((item) => {
    const card = createEl('div', { className: 'feature-item' });
    const icon = createEl('span', { className: 'material-icons feature-icon', text: item.icon });
    const title = createEl('h3', { text: item.title });
    const paragraph = createEl('p', { className: 'muted-paragraph', text: item.text });
    appendChildren(card, [icon, title, paragraph]);
    grid.appendChild(card);
  });

  appendChildren(featuresContainer, [featuresHeader, grid]);
  features.appendChild(featuresContainer);

  appendChildren(main, [hero, features]);

  const footer = createFooter({
    brand: 'BarberMarket',
    location: 'Brasil',
    note: '© 2026 BarberMarket. Tradição e Tecnologia.'
  });

  appendChildren(appRoot, [header, main, footer]);
})();
