(function () {
  const basePath = window.BASE_PATH || '';
  const layout = window.LAYOUT || {};
  const { createEl, appendChildren, createFooter, createAppHeader } = layout;

  if (!createEl || !appendChildren || !createFooter || !createAppHeader) return;

  const appRoot = document.getElementById('app');
  if (!appRoot) return;
  appRoot.replaceChildren();

  const header = createAppHeader({ basePath, showAppointments: true });

  const appComponents = window.APP_COMPONENTS || {};
  const main = createEl('main', { attrs: { id: 'content' } });

  const hero = appComponents.createHeroSection
    ? appComponents.createHeroSection({})
    : (() => {
        const heroSection = createEl('section', { className: 'hero-section', attrs: { id: 'hero' } });
        const heroContainer = createEl('div', { className: 'container hero-content' });
        const heroTitle = createEl('h2', { text: 'Encontre seu Barbeiro Ideal' });
        const heroText = createEl('p', { text: 'Agende cortes e serviços de barbearia com os nossos melhores profissionais.' });
        const heroCta = createEl('a', {
          className: 'cta-button',
          text: 'Ver Barbeiros',
          attrs: { href: '#professionals' }
        });
        appendChildren(heroContainer, [heroTitle, heroText, heroCta]);
        heroSection.appendChild(heroContainer);
        return heroSection;
      })();

  const professionalsSection = appComponents.createSectionHeader
    ? appComponents.createSectionHeader({
        id: 'professionals',
        title: 'Barbeiros na Sua Região',
        className: 'section professionals-section'
      })
    : null;
  const professionals = professionalsSection?.section || createEl('section', { className: 'section professionals-section', attrs: { id: 'professionals' } });
  const prosContainer = professionalsSection?.container || createEl('div', { className: 'container text-center' });
  if (!professionalsSection) prosContainer.appendChild(createEl('h2', { className: 'section-title', text: 'Barbeiros na Sua Região' }));
  const prosGrid = createEl('div', { className: 'grid-container', attrs: { id: 'professionals-grid' } });
  prosGrid.appendChild(createEl('div', { className: 'loading', text: 'Buscando profissionais...' }));
  prosContainer.appendChild(prosGrid);
  professionals.appendChild(prosContainer);

  const servicesSection = appComponents.createSectionHeader
    ? appComponents.createSectionHeader({
        id: 'services',
        title: 'Serviços Disponíveis',
        className: 'section services-section',
        hidden: true
      })
    : null;
  const services = servicesSection?.section || createEl('section', { className: 'section services-section hidden', attrs: { id: 'services' } });
  const servicesContainer = servicesSection?.container || createEl('div', { className: 'container text-center' });
  if (!servicesSection) servicesContainer.appendChild(createEl('h2', { className: 'section-title', text: 'Serviços Disponíveis' }));
  servicesContainer.appendChild(createEl('div', { className: 'grid-container', attrs: { id: 'services-grid' } }));
  services.appendChild(servicesContainer);

  const about = appComponents.createAboutSection ? appComponents.createAboutSection() : null;

  const profile = createEl('section', { className: 'section profile-view hidden', attrs: { id: 'barber-profile' } });
  const profileContainer = createEl('div', { className: 'container profile-container' });
  const profileBack = createEl('button', { className: 'back-button', attrs: { id: 'close-profile' } });
  profileBack.appendChild(createEl('span', { className: 'material-icons', text: 'arrow_back' }));
  profileBack.appendChild(document.createTextNode(' Voltar para lista'));

  const profileHeader = createEl('div', { className: 'profile-header' });
  const profileAvatar = createEl('div', { className: 'profile-avatar' });
  profileAvatar.appendChild(createEl('span', { className: 'material-icons', text: 'person' }));
  const profileInfo = createEl('div', { className: 'profile-info' });
  profileInfo.appendChild(createEl('h2', { attrs: { id: 'profile-name' }, text: 'Nome do Barbeiro' }));
  profileInfo.appendChild(createEl('p', { attrs: { id: 'profile-specialty' }, text: 'Especialidade' }));
  appendChildren(profileHeader, [profileAvatar, profileInfo]);

  const profileContent = createEl('div', { className: 'profile-content' });
  const servicesCol = createEl('div', { className: 'services-column' });
  servicesCol.appendChild(createEl('h3', { text: 'Serviços e Preços' }));
  servicesCol.appendChild(createEl('div', { className: 'profile-services-grid', attrs: { id: 'profile-services-list' } }));

  const bookingCol = createEl('div', { className: 'booking-column sticky-sidebar' });
  const bookingCard = createEl('div', { className: 'booking-card' });
  bookingCard.appendChild(createEl('h3', { text: 'Agendar Horário' }));
  const bookingFlow = createEl('div', { className: 'booking-flow-compact' });
  const dateGroup = createEl('div', { className: 'form-group' });
  dateGroup.appendChild(createEl('label', { attrs: { for: 'profile-booking-date' }, text: 'Data' }));
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.id = 'profile-booking-date';
  dateGroup.appendChild(dateInput);
  const timeSlots = createEl('div', { className: 'time-grid-compact', attrs: { id: 'profile-time-slots' } });
  timeSlots.appendChild(createEl('p', { className: 'placeholder-text', text: 'Selecione uma data para ver os horários' }));
  const startBtn = createEl('button', { className: 'primary-button', attrs: { id: 'btn-start-booking', disabled: 'true' }, text: 'Agendar Selecionado' });
  appendChildren(bookingFlow, [dateGroup, timeSlots, startBtn]);
  bookingCard.appendChild(bookingFlow);
  bookingCol.appendChild(bookingCard);

  appendChildren(profileContent, [servicesCol, bookingCol]);
  appendChildren(profileContainer, [profileBack, profileHeader, profileContent]);
  profile.appendChild(profileContainer);

  const bookingWizard = createEl('section', { className: 'section hidden', attrs: { id: 'booking-wizard-view' } });
  const bookingContainer = createEl('div', { className: 'container booking-container' });
  const cancelBooking = createEl('button', { className: 'back-button', attrs: { id: 'cancel-booking' } });
  cancelBooking.appendChild(createEl('span', { className: 'material-icons', text: 'close' }));
  cancelBooking.appendChild(document.createTextNode(' Cancelar'));
  bookingContainer.appendChild(cancelBooking);
  bookingContainer.appendChild(createEl('h2', { className: 'section-title', text: 'Finalizar Agendamento' }));
  const wizard = createEl('div', { className: 'booking-wizard' });
  const step = createEl('div', { className: 'wizard-step active', attrs: { 'data-step': '1' } });
  step.appendChild(createEl('h3', { text: 'Resumo do Agendamento' }));
  step.appendChild(createEl('div', { className: 'summary-card', attrs: { id: 'booking-summary' } }));
  step.appendChild(createEl('button', { className: 'confirm-button', attrs: { id: 'confirm-booking' }, text: 'Confirmar Agora' }));
  wizard.appendChild(step);
  bookingContainer.appendChild(wizard);
  bookingWizard.appendChild(bookingContainer);

  const appointments = createEl('section', { className: 'section appointments-section hidden', attrs: { id: 'appointments' } });
  const appointmentsContainer = createEl('div', { className: 'container text-center' });
  appointmentsContainer.appendChild(createEl('h2', { className: 'section-title', text: 'Meus Agendamentos' }));
  appointmentsContainer.appendChild(createEl('div', { className: 'grid-container', attrs: { id: 'appointments-list' } }));
  appointments.appendChild(appointmentsContainer);

  appendChildren(main, [
    hero,
    professionals,
    services,
    ...(about ? [about] : []),
    profile,
    bookingWizard,
    appointments
  ]);

  const footer = createFooter({
    brand: 'BarberMarket',
    location: 'Brasil',
    note: '© 2026 BarberMarket. Tradição e Tecnologia.'
  });

  appendChildren(appRoot, [header, main, footer]);
})();
