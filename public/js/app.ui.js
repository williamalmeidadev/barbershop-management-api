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

  const hero = appComponents.createHeroSection();
  const professionals = appComponents.createProfessionalsSection();
  const services = appComponents.createServicesSection();
  const about = appComponents.createAboutSection();
  const profile = appComponents.createProfileSection();
  const bookingWizard = appComponents.createBookingWizardSection();
  const appointments = appComponents.createAppointmentsSection();

  appendChildren(main, [hero, professionals, services, about, profile, bookingWizard, appointments]);

  const footer = createFooter({
    brand: 'AlphaCuts',
    location: 'Brasil',
    note: '© 2026 AlphaCuts. Tradição e Tecnologia.'
  });

  appendChildren(appRoot, [header, main, footer]);
})();
