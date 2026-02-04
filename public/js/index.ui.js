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
    text: 'A barbearia referência da região. Cortes modernos, barba impecável e agendamento descomplicado para o homem moderno.'
  });
  const heroActions = createEl('div', { className: 'hero-actions' });
  const heroCta = createEl('a', { className: 'cta-button', text: 'Entrar na sua conta', attrs: { href: `${basePath}/login` } });
  const heroAdmin = createEl('a', { className: 'nav-button nav-button-hero', text: 'Sou Barbeiro', attrs: { href: `${basePath}/admin-login` } });
  appendChildren(heroActions, [heroCta, heroAdmin]);
  appendChildren(heroContainer, [heroTitle, heroDesc, heroActions]);
  hero.appendChild(heroContainer);

  const features = createEl('section', { className: 'section' });
  const featuresContainer = createEl('div', { className: 'container' });
  const featuresHeader = createEl('div', { className: 'text-center' });
  featuresHeader.appendChild(createEl('h2', { className: 'section-title', text: 'Por que usar o AlphaCuts?' }));
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

  const testimonials = createEl('section', { className: 'section testimonials-section' });
  const tContainer = createEl('div', { className: 'container' });
  const tHeader = createEl('div', { className: 'text-center' });
  tHeader.appendChild(createEl('p', { className: 'section-kicker', text: 'Avaliações' }));
  tHeader.appendChild(createEl('h2', { className: 'section-title', text: 'O que dizem nossos clientes' }));

  const carousel = createEl('div', { className: 'reviews-carousel' });
  const track = createEl('div', { className: 'reviews-track', attrs: { id: 'reviews-track-landing' } });
  const reviews = [
    { nome: 'Carlos M.', nota: '5.0', texto: 'Atendimento excelente e corte impecável. Virei cliente fixo.' },
    { nome: 'Rafael S.', nota: '4.9', texto: 'Ambiente top, barbeiro muito técnico e pontual.' },
    { nome: 'João P.', nota: '5.0', texto: 'Agendamento rápido e resultado acima do esperado.' },
    { nome: 'Matheus L.', nota: '4.8', texto: 'Ótimo custo-benefício e profissionais muito atenciosos.' },
    { nome: 'Bruno A.', nota: '5.0', texto: 'Barba perfeita e ótimo atendimento. Recomendo demais.' },
    { nome: 'Diego R.', nota: '4.9', texto: 'Estrutura excelente e profissionais muito qualificados.' }
  ];
  reviews.forEach((review) => {
    const card = createEl('article', { className: 'review-card' });
    card.appendChild(createEl('div', { className: 'review-stars', text: `★ ${review.nota}` }));
    card.appendChild(createEl('p', { className: 'review-text', text: review.texto }));
    card.appendChild(createEl('strong', { className: 'review-author', text: review.nome }));
    track.appendChild(card);
  });
  carousel.appendChild(track);
  appendChildren(tContainer, [tHeader, carousel]);
  testimonials.appendChild(tContainer);

  appendChildren(main, [hero, features, testimonials]);

  const footer = createFooter({
    brand: 'AlphaCuts',
    location: 'Brasil',
    note: '© 2026 AlphaCuts. Tradição e Tecnologia.'
  });

  appendChildren(appRoot, [header, main, footer]);

  const initLandingReviews = () => {
    const reviewsTrack = document.getElementById('reviews-track-landing');
    if (!reviewsTrack || reviewsTrack.dataset.loopReady) return;
    const boot = () => {
      const items = Array.from(reviewsTrack.children);
      if (!items.length) return;

      // Ensure track overflows before starting animation.
      while (reviewsTrack.scrollWidth <= reviewsTrack.clientWidth && reviewsTrack.children.length < items.length * 4) {
        items.forEach((item) => reviewsTrack.appendChild(item.cloneNode(true)));
      }
      // Duplicate once more so reset is seamless.
      const baseItems = Array.from(reviewsTrack.children);
      baseItems.forEach((item) => reviewsTrack.appendChild(item.cloneNode(true)));

      reviewsTrack.dataset.loopReady = 'true';

      const originalWidth = reviewsTrack.scrollWidth / 2;
      let isPaused = false;
      let timerId = 0;

      const tick = () => {
        if (!isPaused) {
          reviewsTrack.scrollLeft += 1; // integer step avoids browser rounding no-op
          if (reviewsTrack.scrollLeft >= originalWidth) reviewsTrack.scrollLeft = 0;
        }
      };

      reviewsTrack.addEventListener('mouseenter', () => { isPaused = true; });
      reviewsTrack.addEventListener('mouseleave', () => { isPaused = false; });
      timerId = window.setInterval(tick, 24);
      window.addEventListener('beforeunload', () => timerId && window.clearInterval(timerId));
    };

    // Wait one frame so dimensions are accurate.
    window.requestAnimationFrame(boot);
  };

  initLandingReviews();
})();
