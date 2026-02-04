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
    // Selection handled by app.js, keeping initial class

    // 1. Media (Left)
    const mediaWrap = createMedia({
      url: mediaUrl,
      alt: service?.nome || 'Serviço',
      icon: 'content_cut',
      className: 'profile-service-media'
    });

    // 2. Info (Middle)
    const info = document.createElement('div');
    info.className = 'profile-service-info';

    const name = document.createElement('h4');
    name.textContent = service?.nome || 'Serviço';

    const desc = document.createElement('p');
    desc.textContent = service?.descricao || '';

    // Duration row
    const metaRow = document.createElement('div');
    metaRow.className = 'service-meta-row';
    const durIcon = createIcon('schedule');
    const durText = document.createTextNode(` ${service?.duracao_minutos || 30} MIN`);
    metaRow.appendChild(durIcon);
    metaRow.appendChild(durText);

    info.appendChild(name);
    info.appendChild(desc);
    info.appendChild(metaRow);

    // 3. Right Side (Price + Radio)
    const rightCol = document.createElement('div');
    rightCol.className = 'profile-service-right';

    const priceValue = document.createElement('span');
    priceValue.className = 'service-price-tag';
    priceValue.textContent = formatCurrency ? formatCurrency(service?.preco_centavos) : String(service?.preco_centavos || 0);

    const radioIndicator = document.createElement('div');
    radioIndicator.className = `service-radio-indicator ${selected ? 'checked' : ''}`;

    rightCol.appendChild(priceValue);
    rightCol.appendChild(radioIndicator);

    card.appendChild(mediaWrap);
    card.appendChild(info);
    card.appendChild(rightCol);

    if (onSelect) card.onclick = onSelect;
    return card;
  };

  const createAppointmentCard = ({
    title,
    status,
    serviceName,
    dateText,
    priceText,
    originalPriceText,
    discountText,
    finalPriceText,
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
    if (originalPriceText || discountText || finalPriceText) {
      price.appendChild(createInfoRow('Original:', originalPriceText || (formatCurrency ? formatCurrency(0) : 'R$ 0,00')));
      price.appendChild(createInfoRow('Desconto:', discountText || (formatCurrency ? formatCurrency(0) : 'R$ 0,00')));
      const finalRow = createInfoRow('Final:', finalPriceText || priceText || (formatCurrency ? formatCurrency(0) : 'R$ 0,00'));
      finalRow.classList.add('appointment-total');
      price.appendChild(finalRow);
    } else {
      price.textContent = priceText || (formatCurrency ? formatCurrency(0) : 'R$ 0,00');
    }

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
      const badge = document.createElement('div');
      badge.className = 'hero-badge';
      badge.textContent = '• Atendimentos premium';
      const h2 = document.createElement('h2');
      h2.innerHTML = title || 'Mestria em <span>Cada Corte.</span>';
      const p = document.createElement('p');
      p.textContent = description || 'Agende cortes e serviços de barbearia com os nossos melhores profissionais.';
      const actions = document.createElement('div');
      actions.className = 'hero-actions';

      const ctaPrimary = document.createElement('a');
      ctaPrimary.className = 'cta-button';
      ctaPrimary.textContent = ctaLabel || 'Agendar Agora';
      ctaPrimary.href = ctaHref || '#professionals';

      const ctaSecondary = document.createElement('a');
      ctaSecondary.className = 'nav-button nav-button-hero';
      ctaSecondary.textContent = 'Ver Serviços';
      ctaSecondary.href = '#services';
      actions.appendChild(ctaPrimary);
      actions.appendChild(ctaSecondary);

      const stats = document.createElement('div');
      stats.className = 'hero-stats';
      const items = [
        { key: 'rating', value: '4.9/5', label: 'Avaliação' },
        { key: 'cuts', value: '0', label: 'Cortes' },
        { key: 'barbers', value: '0', label: 'Barbeiros' }
      ];
      items.forEach((item) => {
        const stat = document.createElement('div');
        stat.className = 'hero-stat';
        const value = document.createElement('strong');
        value.id = `hero-stat-${item.key}`;
        value.textContent = item.value;
        const label = document.createElement('small');
        label.textContent = item.label;
        stat.appendChild(value);
        stat.appendChild(label);
        stats.appendChild(stat);
      });

      container.appendChild(badge);
      container.appendChild(h2);
      container.appendChild(p);
      container.appendChild(actions);
      container.appendChild(stats);
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
      h2.textContent = 'Sobre a AlphaCuts';
      const lead = document.createElement('p');
      lead.className = 'lead';
      lead.textContent = 'Tradição e estilo se encontram aqui.';
      const p1 = document.createElement('p');
      p1.textContent = 'Fundada com o objetivo de conectar os melhores profissionais aos clientes mais exigentes, a AlphaCuts moderniza a experiência da barbearia clássica.';
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
    },
    createProfessionalsSection: () => {
      const { section, container } = window.APP_COMPONENTS.createSectionHeader({
        id: 'professionals',
        title: 'Conheça Nossos Barbeiros Master',
        className: 'section professionals-section'
      });
      const kicker = document.createElement('p');
      kicker.className = 'section-kicker';
      kicker.textContent = 'Os Artesãos';
      const subtitle = document.createElement('p');
      subtitle.className = 'section-subtitle';
      subtitle.textContent = 'Profissionais de alto nível, especialistas em precisão e estilo.';
      container.insertBefore(kicker, container.firstChild);
      container.appendChild(subtitle);
      const grid = document.createElement('div');
      grid.className = 'grid-container';
      grid.id = 'professionals-grid';
      const loading = document.createElement('div');
      loading.className = 'loading';
      loading.textContent = 'Buscando profissionais...';
      grid.appendChild(loading);
      container.appendChild(grid);
      section.appendChild(container);
      return section;
    },
    createServicesSection: () => {
      const { section, container } = window.APP_COMPONENTS.createSectionHeader({
        id: 'services',
        title: 'Serviços Disponíveis',
        className: 'section services-section',
        hidden: true
      });
      const grid = document.createElement('div');
      grid.className = 'grid-container';
      grid.id = 'services-grid';
      container.appendChild(grid);
      section.appendChild(container);
      return section;
    },
    createTestimonialsSection: () => {
      const section = document.createElement('section');
      section.className = 'section testimonials-section hidden';
      section.id = 'testimonials';

      const container = document.createElement('div');
      container.className = 'container';

      const header = document.createElement('div');
      header.className = 'text-center';
      const kicker = document.createElement('p');
      kicker.className = 'section-kicker';
      kicker.textContent = 'Avaliações';
      const title = document.createElement('h2');
      title.className = 'section-title';
      title.textContent = 'O que dizem nossos clientes';
      header.appendChild(kicker);
      header.appendChild(title);

      const carousel = document.createElement('div');
      carousel.className = 'reviews-carousel';

      const track = document.createElement('div');
      track.className = 'reviews-track';
      track.id = 'reviews-track';

      const reviews = [
        { nome: 'Carlos M.', nota: '5.0', texto: 'Atendimento excelente e corte impecável. Virei cliente fixo.' },
        { nome: 'Rafael S.', nota: '4.9', texto: 'Ambiente top, barbeiro muito técnico e pontual.' },
        { nome: 'João P.', nota: '5.0', texto: 'Agendamento rápido e resultado acima do esperado.' },
        { nome: 'Matheus L.', nota: '4.8', texto: 'Ótimo custo-benefício e profissionais muito atenciosos.' },
        { nome: 'Bruno A.', nota: '5.0', texto: 'Barba perfeita e ótimo atendimento. Recomendo demais.' },
        { nome: 'Diego R.', nota: '4.9', texto: 'Estrutura excelente e profissionais muito qualificados.' },
        { nome: 'Felipe T.', nota: '4.8', texto: 'Pontualidade e qualidade acima da média.' },
        { nome: 'Henrique V.', nota: '5.0', texto: 'Melhor experiência de barbearia da cidade.' }
      ];

      reviews.forEach((review) => {
        const card = document.createElement('article');
        card.className = 'review-card';
        const stars = document.createElement('div');
        stars.className = 'review-stars';
        stars.textContent = `★ ${review.nota}`;
        const text = document.createElement('p');
        text.className = 'review-text';
        text.textContent = review.texto;
        const author = document.createElement('strong');
        author.className = 'review-author';
        author.textContent = review.nome;
        card.appendChild(stars);
        card.appendChild(text);
        card.appendChild(author);
        track.appendChild(card);
      });

      carousel.appendChild(track);

      container.appendChild(header);
      container.appendChild(carousel);
      section.appendChild(container);
      return section;
    },
    createProfileSection: () => {
      const section = document.createElement('section');
      section.className = 'section profile-view hidden';
      section.id = 'barber-profile';
      const container = document.createElement('div');
      container.className = 'container profile-container';
      const backBtn = document.createElement('button');
      backBtn.className = 'back-button';
      backBtn.id = 'close-profile';
      const backIcon = document.createElement('span');
      backIcon.className = 'material-icons';
      backIcon.textContent = 'arrow_back';
      backBtn.appendChild(backIcon);
      backBtn.appendChild(document.createTextNode(' Voltar para lista'));

      const header = document.createElement('div');
      header.className = 'profile-header';
      const avatar = document.createElement('div');
      avatar.className = 'profile-avatar';
      const avatarIcon = document.createElement('span');
      avatarIcon.className = 'material-icons';
      avatarIcon.textContent = 'person';
      avatar.appendChild(avatarIcon);
      const info = document.createElement('div');
      info.className = 'profile-info';
      const name = document.createElement('h2');
      name.id = 'profile-name';
      name.textContent = 'Nome do Barbeiro';
      const specialty = document.createElement('p');
      specialty.id = 'profile-specialty';
      specialty.textContent = 'Especialidade';
      info.appendChild(name);
      info.appendChild(specialty);
      header.appendChild(avatar);
      header.appendChild(info);

      const content = document.createElement('div');
      content.className = 'profile-content';
      const servicesCol = document.createElement('div');
      servicesCol.className = 'services-column';
      servicesCol.appendChild(document.createElement('h3')).textContent = 'Serviços e Preços';
      const servicesList = document.createElement('div');
      servicesList.className = 'profile-services-grid';
      servicesList.id = 'profile-services-list';
      servicesCol.appendChild(servicesList);

      const bookingCol = document.createElement('div');
      bookingCol.className = 'booking-column sticky-sidebar';
      const bookingCard = document.createElement('div');
      bookingCard.className = 'booking-card';

      // Header matching reference
      const cardHeader = document.createElement('div');
      cardHeader.className = 'booking-card-header';
      const headerIcon = document.createElement('span');
      headerIcon.className = 'material-icons';
      headerIcon.textContent = 'calendar_today';
      cardHeader.appendChild(headerIcon);
      cardHeader.appendChild(document.createTextNode(' RESERVA'));
      bookingCard.appendChild(cardHeader);

      const bookingFlow = document.createElement('div');
      bookingFlow.className = 'booking-flow-compact';

      // Date Selector
      const dateGroup = document.createElement('div');
      dateGroup.className = 'form-group';
      // Label is redundant if header implies context, but keeping specific label is fine or removing for cleaner look.
      // Reference has 'NOVEMBER 2023' dynamic text. We'll use a container for that if needed, 
      // but existing logic uses the date selector. Let's keep dateSelector.

      const dateSelector = document.createElement('div');
      dateSelector.id = 'profile-date-selector';
      dateSelector.className = 'date-selector-container';
      dateGroup.appendChild(dateSelector);

      // Time Slots
      const timeSlots = document.createElement('div');
      timeSlots.className = 'time-grid-compact';
      timeSlots.id = 'profile-time-slots';

      const placeholder = document.createElement('p');
      placeholder.className = 'placeholder-text';
      placeholder.textContent = 'Selecione uma data';
      timeSlots.appendChild(placeholder);

      // PREVIEW SUMMARY (New)
      const previewSummary = document.createElement('div');
      previewSummary.id = 'booking-preview-summary';
      previewSummary.className = 'booking-preview-summary';
      // Init hidden or empty

      const startBtn = document.createElement('button');
      startBtn.className = 'primary-button full-width';
      startBtn.id = 'btn-start-booking';
      startBtn.disabled = true;
      startBtn.innerHTML = 'CONFIRMAR AGENDAMENTO <span class="material-icons">arrow_forward</span>';

      bookingFlow.appendChild(dateGroup);
      bookingFlow.appendChild(document.createElement('h4')).textContent = 'Horários Disponíveis';
      bookingFlow.querySelector('h4').className = 'subsection-title';
      bookingFlow.appendChild(timeSlots);
      bookingFlow.appendChild(previewSummary); // Inserted summary
      bookingFlow.appendChild(startBtn);

      bookingCard.appendChild(bookingFlow);
      bookingCol.appendChild(bookingCard);

      content.appendChild(servicesCol);
      content.appendChild(bookingCol);

      container.appendChild(backBtn);
      container.appendChild(header);
      container.appendChild(content);
      section.appendChild(container);
      return section;
    },
    createBookingWizardSection: () => {
      const section = document.createElement('section');
      section.className = 'section hidden';
      section.id = 'booking-wizard-view';
      const container = document.createElement('div');
      container.className = 'container booking-container';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'back-button';
      cancelBtn.id = 'cancel-booking';
      const cancelIcon = document.createElement('span');
      cancelIcon.className = 'material-icons';
      cancelIcon.textContent = 'close';
      cancelBtn.appendChild(cancelIcon);
      cancelBtn.appendChild(document.createTextNode(' Cancelar'));
      container.appendChild(cancelBtn);
      container.appendChild(document.createElement('h2')).className = 'section-title';
      container.querySelector('h2').textContent = 'Finalizar Agendamento';
      const wizard = document.createElement('div');
      wizard.className = 'booking-wizard';
      const step = document.createElement('div');
      step.className = 'wizard-step active';
      step.dataset.step = '1';
      step.appendChild(document.createElement('h3')).textContent = 'Resumo do Agendamento';
      const summary = document.createElement('div');
      summary.className = 'summary-card';
      summary.id = 'booking-summary';
      step.appendChild(summary);
      const confirm = document.createElement('button');
      confirm.className = 'confirm-button';
      confirm.id = 'confirm-booking';
      confirm.textContent = 'Confirmar Agora';
      step.appendChild(confirm);
      wizard.appendChild(step);
      container.appendChild(wizard);
      section.appendChild(container);
      return section;
    },
    createAppointmentsSection: () => {
      const { section, container } = window.APP_COMPONENTS.createSectionHeader({
        id: 'appointments',
        title: 'Meus Agendamentos',
        className: 'section appointments-section',
        hidden: true
      });
      const grid = document.createElement('div');
      grid.className = 'grid-container';
      grid.id = 'appointments-list';
      container.appendChild(grid);
      section.appendChild(container);
      return section;
    },
    createFormGroup: ({ label, input, className = 'form-group' } = {}) => {
      const group = document.createElement('div');
      group.className = className;
      const lbl = document.createElement('label');
      lbl.textContent = label || '';
      group.appendChild(lbl);
      if (input) group.appendChild(input);
      return group;
    },
    createInput: ({ type = 'text', value, placeholder, min, max, step, className } = {}) => {
      const input = document.createElement('input');
      input.type = type;
      if (value !== undefined) input.value = value;
      if (placeholder) input.placeholder = placeholder;
      if (min !== undefined) input.min = String(min);
      if (max !== undefined) input.max = String(max);
      if (step !== undefined) input.step = String(step);
      if (className) input.className = className;
      return input;
    },
    createSelect: ({ options = [], value, className } = {}) => {
      const select = document.createElement('select');
      if (className) select.className = className;
      options.forEach((opt) => {
        const option = document.createElement('option');
        option.value = String(opt.value);
        option.textContent = opt.label;
        if (value !== undefined && String(value) === String(opt.value)) option.selected = true;
        select.appendChild(option);
      });
      return select;
    }
  };
})();
