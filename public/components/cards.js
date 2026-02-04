(function () {
  const ui = window.UI || {};
  const createCard = ui.createCard;
  const createMedia = ui.createMedia;
  const createIcon = ui.createIcon;
  const formatCurrency = ui.formatCurrency;

  if (!createCard || !createMedia || !createIcon) return;

  const createServiceCard = ({ name, description, duration, price, mediaUrl } = {}) => {
    const card = createCard('card service-card');
    const mediaWrap = createMedia({
      url: mediaUrl,
      alt: name || 'Serviço',
      icon: 'content_cut',
      className: 'service-media-app'
    });

    const title = document.createElement('h3');
    title.className = 'centered-title';
    title.textContent = name || 'Serviço';

    const desc = document.createElement('p');
    desc.className = 'centered-muted';
    desc.textContent = description || 'Procedimento realizado com os melhores produtos do mercado.';

    const footer = document.createElement('div');
    footer.className = 'service-meta';

    const durationEl = document.createElement('div');
    durationEl.className = 'service-duration';
    durationEl.appendChild(createIcon('schedule'));
    durationEl.appendChild(document.createTextNode(` ${duration || 0} min`));

    const priceEl = document.createElement('div');
    priceEl.className = 'service-price';
    priceEl.textContent = formatCurrency ? formatCurrency(price) : String(price || 0);

    footer.appendChild(durationEl);
    footer.appendChild(priceEl);

    card.appendChild(mediaWrap);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);

    return card;
  };

  const createProfessionalCard = ({ name, bio, mediaUrl, onClick } = {}) => {
    const card = createCard('card');

    const avatar = createMedia({
      url: mediaUrl,
      alt: name || 'Barbeiro',
      icon: 'person',
      className: 'avatar-container',
      imgClass: 'barber-avatar-img'
    });

    const title = document.createElement('h3');
    title.className = 'centered-title';
    title.textContent = name || 'Barbeiro';

    const description = document.createElement('p');
    description.className = 'centered-muted';
    description.textContent = bio || 'Barbeiro Profissional';

    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'centered-cta';
    const cta = document.createElement('span');
    cta.textContent = 'Ver Serviços e Horários';
    ctaWrap.appendChild(cta);

    card.appendChild(avatar);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(ctaWrap);

    if (onClick) card.onclick = onClick;
    return card;
  };

  window.CARDS = {
    createServiceCard,
    createProfessionalCard
  };
})();
