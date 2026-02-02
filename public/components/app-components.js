(function () {
  const ui = window.UI || {};
  const createCard = ui.createCard;
  const createCardWithHeader = ui.createCardWithHeader;
  const createBadge = ui.createBadge;
  const createInfoRow = ui.createInfoRow;
  const createMedia = ui.createMedia;
  const createButton = ui.createButton;
  const formatCurrency = ui.formatCurrency;
  const createIcon = ui.createIcon;

  if (!createCard || !createCardWithHeader || !createInfoRow || !createMedia || !createButton) return;

  const createProfileServiceCard = ({ service, selected, mediaUrl, onSelect } = {}) => {
    const card = createCard(`profile-service-card ${selected ? 'selected' : ''}`);
    card.dataset.id = String(service?.id || '');

    const mediaWrap = createMedia({
      url: mediaUrl,
      alt: service?.nome || 'Serviço',
      icon: 'content_cut',
      className: 'profile-service-media'
    });

    const info = document.createElement('div');
    info.className = 'profile-service-info';
    const name = document.createElement('h4');
    name.textContent = service?.nome || 'Serviço';
    const desc = document.createElement('p');
    desc.textContent = service?.descricao || 'Serviço de alta qualidade';
    info.appendChild(name);
    info.appendChild(desc);

    const price = document.createElement('div');
    price.className = 'profile-service-price';
    const priceValue = document.createElement('span');
    priceValue.textContent = formatCurrency ? formatCurrency(service?.preco_centavos) : String(service?.preco_centavos || 0);
    const duration = document.createElement('p');
    duration.textContent = `${service?.duracao_minutos || 30} min`;
    price.appendChild(priceValue);
    price.appendChild(duration);

    card.appendChild(mediaWrap);
    card.appendChild(info);
    card.appendChild(price);
    if (onSelect) card.onclick = onSelect;
    return card;
  };

  const createAppointmentCard = ({
    title,
    status,
    serviceName,
    dateText,
    priceText,
    cancelLabel,
    canCancel,
    onCancel
  } = {}) => {
    const { card, header } = createCardWithHeader({
      title,
      icon: 'content_cut',
      className: 'appointment-card',
      headerClass: 'appointment-header',
      titleClass: 'appointment-title',
      statusClass: 'appointment-status'
    });
    header.appendChild(createBadge(status || '', 'appointment-status'));

    const details = document.createElement('div');
    details.className = 'appointment-details';
    details.appendChild(createInfoRow('Serviço:', serviceName || '-'));
    details.appendChild(createInfoRow('Data:', dateText || '-'));

    const price = document.createElement('div');
    price.className = 'appointment-price';
    price.textContent = priceText || (formatCurrency ? formatCurrency(0) : 'R$ 0,00');

    const cancelBtn = createButton(cancelLabel || 'Cancelar', 'btn-cancel');
    cancelBtn.disabled = !canCancel;
    if (onCancel) cancelBtn.onclick = (evt) => onCancel(evt, cancelBtn);

    card.appendChild(details);
    card.appendChild(price);
    card.appendChild(cancelBtn);
    return card;
  };

  const createBookingSummary = ({ professional, service, dateText, totalText, note } = {}) => {
    const summary = document.createElement('div');
    summary.className = 'summary-item';
    const title = document.createElement('div');
    title.className = 'summary-title';
    title.textContent = 'Resumo do Pedido';
    summary.appendChild(title);
    summary.appendChild(createInfoRow('Profissional:', professional || '-'));
    summary.appendChild(createInfoRow('Serviço:', service || '-'));
    summary.appendChild(createInfoRow('Agendado para:', dateText || '-'));
    const totalRow = createInfoRow('Total:', totalText || (formatCurrency ? formatCurrency(0) : 'R$ 0,00'));
    totalRow.classList.add('summary-total');
    summary.appendChild(totalRow);

    const noteEl = document.createElement('div');
    noteEl.className = 'summary-note';
    noteEl.textContent = note || 'Pagamento e confirmação serão feitos no local.';
    return { summary, note: noteEl };
  };

  const createTimeSlot = ({ label, selected, onClick } = {}) => {
    const item = document.createElement('div');
    item.className = `time-slot-compact ${selected ? 'selected' : ''}`;
    item.textContent = label || '';
    if (onClick) item.onclick = onClick;
    return item;
  };

  const createServiceMeta = ({ duration, price } = {}) => {
    const footer = document.createElement('div');
    footer.className = 'service-meta';
    const durationEl = document.createElement('div');
    durationEl.className = 'service-duration';
    durationEl.appendChild(createIcon('schedule'));
    durationEl.appendChild(document.createTextNode(` ${duration || 0} min`));
    const priceEl = document.createElement('div');
    priceEl.className = 'service-price';
    priceEl.textContent = price || (formatCurrency ? formatCurrency(0) : 'R$ 0,00');
    footer.appendChild(durationEl);
    footer.appendChild(priceEl);
    return footer;
  };

  window.APP_COMPONENTS = {
    createProfileServiceCard,
    createAppointmentCard,
    createBookingSummary,
    createTimeSlot,
    createServiceMeta,
    createHeroSection: ({ title, description, ctaLabel, ctaHref } = {}) => {
      const hero = document.createElement('section');
      hero.className = 'hero-section';
      hero.id = 'hero';
      const container = document.createElement('div');
      container.className = 'container hero-content';
      const h2 = document.createElement('h2');
      h2.textContent = title || 'Encontre seu Barbeiro Ideal';
      const p = document.createElement('p');
      p.textContent = description || 'Agende cortes e serviços de barbearia com os nossos melhores profissionais.';
      const cta = document.createElement('a');
      cta.className = 'cta-button';
      cta.textContent = ctaLabel || 'Ver Barbeiros';
      cta.href = ctaHref || '#professionals';
      container.appendChild(h2);
      container.appendChild(p);
      container.appendChild(cta);
      hero.appendChild(container);
      return hero;
    },
    createSectionHeader: ({ id, title, className = 'section', titleClass = 'section-title', hidden = false } = {}) => {
      const section = document.createElement('section');
      section.className = className + (hidden ? ' hidden' : '');
      if (id) section.id = id;
      const container = document.createElement('div');
      container.className = 'container text-center';
      const h2 = document.createElement('h2');
      h2.className = titleClass;
      h2.textContent = title || '';
      container.appendChild(h2);
      section.appendChild(container);
      return { section, container };
    },
    createAboutSection: () => {
      const section = document.createElement('section');
      section.className = 'section bg-light hidden';
      section.id = 'about';
      const container = document.createElement('div');
      container.className = 'container';
      const wrapper = document.createElement('div');
      wrapper.className = 'about-wrapper';
      const text = document.createElement('div');
      text.className = 'about-text';
      const h2 = document.createElement('h2');
      h2.className = 'section-title';
      h2.textContent = 'Sobre a BarberMarket';
      const lead = document.createElement('p');
      lead.className = 'lead';
      lead.textContent = 'Tradição e estilo se encontram aqui.';
      const p1 = document.createElement('p');
      p1.textContent = 'Fundada com o objetivo de conectar os melhores profissionais aos clientes mais exigentes, a BarberMarket moderniza a experiência da barbearia clássica.';
      const p2 = document.createElement('p');
      p2.textContent = 'Nossa plataforma garante agilidade no agendamento e qualidade no serviço, permitindo que você encontre o profissional ideal para o seu estilo.';
      const list = document.createElement('ul');
      list.className = 'about-features';
      ['Agendamento Online', 'Melhores Profissionais', 'Avaliações Reais'].forEach((item) => {
        const li = document.createElement('li');
        const icon = document.createElement('span');
        icon.className = 'material-icons';
        icon.textContent = 'check_circle';
        li.appendChild(icon);
        li.appendChild(document.createTextNode(` ${item}`));
        list.appendChild(li);
      });
      text.appendChild(h2);
      text.appendChild(lead);
      text.appendChild(p1);
      text.appendChild(p2);
      text.appendChild(list);
      const imageWrap = document.createElement('div');
      imageWrap.className = 'about-image';
      const img = document.createElement('img');
      img.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      img.alt = 'Interior da Barbearia';
      imageWrap.appendChild(img);
      wrapper.appendChild(text);
      wrapper.appendChild(imageWrap);
      container.appendChild(wrapper);
      section.appendChild(container);
      return section;
    }
  };
})();
