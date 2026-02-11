const BASE_PATH = window.BASE_PATH || '';
const ui = window.UI || {};
const formatCurrency = ui.formatCurrency;
const el = ui.el;
const appUtils = window.APP_UTILS || {};
const getCookieValue = appUtils.getCookieValue;
const normalizeImageUrl = appUtils.normalizeImageUrl;
const createMedia = ui.createMedia;
const cards = window.CARDS || {};
const createServiceCardComponent = cards.createServiceCard;
const createProfessionalCardComponent = cards.createProfessionalCard;
const appComponents = window.APP_COMPONENTS || {};
const createProfileServiceCardComponent = appComponents.createProfileServiceCard;
const createAppointmentCardComponent = appComponents.createAppointmentCard;
const createBookingSummaryComponent = appComponents.createBookingSummary;
const createTimeSlotComponent = appComponents.createTimeSlot;
const renderStatus = ui.renderStatus;
const renderLoading = ui.renderLoading;
const renderCardList = ui.renderCardList;

const APP_TIMEZONE = 'America/Sao_Paulo';
const dateFormatterBR = new Intl.DateTimeFormat('pt-BR', { timeZone: APP_TIMEZONE });
const timeFormatterBR = new Intl.DateTimeFormat('pt-BR', {
    timeZone: APP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
});
const formatDateBR = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '';
    return dateFormatterBR.format(date);
};
const formatTimeBR = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '';
    return timeFormatterBR.format(date);
};
const formatTimeSlot = (value) => {
    if (typeof value !== 'string') return formatTimeBR(value);
    const hasTz = /Z$/.test(value) || /[+-]\d{2}:\d{2}$/.test(value);
    if (hasTz) return formatTimeBR(value);
    const match = value.match(/T(\d{2}:\d{2})/);
    return match ? match[1] : formatTimeBR(value);
};

const clientTokenCookie = getCookieValue ? getCookieValue('client_token') : null;
if (!clientTokenCookie) {
    window.location.replace(`${BASE_PATH}/login`);
}

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const state = {
        allServices: [],
        services: [],
        professionals: [],
        selectedServices: [], // Array of service objects
        selectedProfessional: null,
        selectedDate: null, // YYYY-MM-DD
        selectedTime: null,
        customerName: '',
        customerPhone: '',
        currentStep: 1,
        token: clientTokenCookie ? decodeURIComponent(clientTokenCookie) : null,
        isLoggedIn: !!clientTokenCookie,
        calcTimeout: null
    };

    // --- DOM Elements ---
    const professionalsGrid = document.getElementById('professionals-grid');
    const servicesGrid = document.getElementById('services-grid');
    const barberProfileView = document.getElementById('barber-profile');
    const bookingWizardView = document.getElementById('booking-wizard-view');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navAppointments = document.getElementById('nav-appointments');
    const appointmentsList = document.getElementById('appointments-list');

    // Profile Elements
    const closeProfileBtn = document.getElementById('close-profile');
    const profileName = document.getElementById('profile-name');
    const profileSpecialty = document.getElementById('profile-specialty');
    const profileServicesList = document.getElementById('profile-services-list');
    const profileTimeSlots = document.getElementById('profile-time-slots');
    const btnStartBooking = document.getElementById('btn-start-booking');
    // Note: profileBookingDate (input) removed, using #profile-date-selector

    // Wizard Elements
    const cancelBookingBtn = document.getElementById('cancel-booking');
    const bookingSummary = document.getElementById('booking-summary');
    const confirmBtn = document.getElementById('confirm-booking');
    const wizardSteps = document.querySelectorAll('.wizard-step');

    // --- Initialization ---
    init();

    async function init() {
        await loadInitialData();
        renderHeroStats();

        renderProfessionals();
        renderServices();

        setupNavigation();
        setupEventListeners();
        updateAuthUI();

        // Restore state if returning from navigation
        await restoreBookingState();

        // Save state on unload
        window.addEventListener('beforeunload', saveBookingState);
    }

    function updateAuthUI() {
        if (state.isLoggedIn) {
            const navAppointments = document.getElementById('nav-appointments');
            const navProfile = document.getElementById('nav-profile');

            if (navAppointments) navAppointments.classList.remove('hidden');
            if (navProfile) navProfile.classList.remove('hidden');

            const authBtn = document.getElementById('auth-action');
            if (authBtn) {
                authBtn.innerText = 'Sair';
                authBtn.href = "#";
            }
        }
    }

    function saveBookingState() {
        if (!state.selectedProfessional && state.selectedServices.length === 0) return;

        const bookingState = {
            professionalId: state.selectedProfessional ? state.selectedProfessional.id : null,
            serviceIds: state.selectedServices.map(s => s.id),
            date: state.selectedDate,
            time: state.selectedTime
        };
        sessionStorage.setItem('barber_booking_state', JSON.stringify(bookingState));
    }

    async function restoreBookingState() {
        const saved = sessionStorage.getItem('barber_booking_state');
        if (!saved) return;

        try {
            const bookingState = JSON.parse(saved);
            if (!bookingState.professionalId) return;

            // 1. Restore Professional
            await showBarberProfile(bookingState.professionalId);

            // 2. Restore selections
            if (bookingState.serviceIds && bookingState.serviceIds.length > 0) {
                state.selectedServices = state.services.filter(s => bookingState.serviceIds.includes(s.id));
            }
            state.selectedDate = bookingState.date || null;
            state.selectedTime = bookingState.time || null;

            // 3. Update UI
            renderProfileServices();

            if (state.selectedDate) {
                renderDateSelector();
                await loadProfileTimeSlots();
            }

            checkBookingReady();
            updateBookingPreview();

        } catch (error) {
            console.error('Failed to restore booking state:', error);
            sessionStorage.removeItem('barber_booking_state');
        }
    }

    async function loadInitialData() {
        try {
            state.allServices = await services.fetchServices();
            state.services = state.allServices;
            state.professionals = await services.fetchBarbeiros();
        } catch (error) {
            console.error('Falha ao carregar dados iniciais', error);
            showNotification('Falha ao carregar dados do sistema', 'error');
        }
    }

    function renderHeroStats() {
        const cutsEl = document.getElementById('hero-stat-cuts');
        const barbersEl = document.getElementById('hero-stat-barbers');
        if (cutsEl) cutsEl.textContent = `${state.allServices.length}+`;
        if (barbersEl) barbersEl.textContent = `${state.professionals.length}+`;
    }

    // --- Navigation Logic ---
    function initReviewsCarousel() {
        const reviewsTrack = document.getElementById('reviews-track');
        if (!reviewsTrack || reviewsTrack.dataset.loopReady) return;

        // Wait until the section is visible and has measurable width.
        if (reviewsTrack.offsetWidth === 0 || reviewsTrack.scrollWidth === 0) {
            window.requestAnimationFrame(initReviewsCarousel);
            return;
        }

        const originalItems = Array.from(reviewsTrack.children);
        originalItems.forEach((item) => {
            reviewsTrack.appendChild(item.cloneNode(true));
        });
        reviewsTrack.dataset.loopReady = 'true';

        const first = reviewsTrack.children[0];
        const mid = reviewsTrack.children[originalItems.length - 1];
        const originalWidth = first && mid
            ? (mid.getBoundingClientRect().right - first.getBoundingClientRect().left + reviewsTrack.scrollLeft)
            : (reviewsTrack.scrollWidth / 2);
        let isPaused = false;
        let rafId = 0;
        const speed = 0.5;

        const tick = () => {
            if (!isPaused) {
                reviewsTrack.scrollLeft += speed;
                if (reviewsTrack.scrollLeft >= originalWidth) {
                    reviewsTrack.scrollLeft = 0;
                }
            }
            rafId = window.requestAnimationFrame(tick);
        };

        reviewsTrack.addEventListener('mouseenter', () => { isPaused = true; });
        reviewsTrack.addEventListener('mouseleave', () => { isPaused = false; });
        tick();

        window.addEventListener('beforeunload', () => {
            if (rafId) window.cancelAnimationFrame(rafId);
        });
    }

    function setupNavigation() {
        const views = {
            home: ['hero', 'professionals', 'services'],
            about: ['about'],
            appointments: ['appointments']
        };

        window.navigateTo = function (viewName) {
            const allSections = [
                'hero', 'professionals', 'services', 'about', 'appointments',
                'barber-profile', 'booking-wizard-view'
            ];

            allSections.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });

            if (views[viewName]) {
                views[viewName].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.remove('hidden');
                });
            }

            if (viewName === 'appointments') {
                renderAppointments();
            }
            if (viewName === 'home') initReviewsCarousel();

            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            const activeLink = document.getElementById(`nav-${viewName}`);
            if (activeLink) activeLink.classList.add('active');

            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }

            window.scrollTo(0, 0);
        };

        document.getElementById('nav-home')?.addEventListener('click', (e) => { e.preventDefault(); window.navigateTo('home'); });
        document.getElementById('nav-about')?.addEventListener('click', (e) => { e.preventDefault(); window.navigateTo('about'); });
        document.getElementById('nav-appointments')?.addEventListener('click', (e) => { e.preventDefault(); window.navigateTo('appointments'); });

        const hash = window.location.hash;
        if (hash === '#about') window.navigateTo('about');
        else if (hash === '#appointments') window.navigateTo('appointments');
        else window.navigateTo('home');
    }

    // --- Renderers ---
    function renderServices() {
        if (!servicesGrid) return;
        if (!state.allServices || state.allServices.length === 0) {
            renderLoading(servicesGrid, 'Carregando serviços...');
            return;
        }
        renderCardList(servicesGrid, state.allServices, (service) => createServiceCardComponent({
            name: service.nome,
            description: service.descricao,
            duration: service.duracao_minutos,
            price: service.preco_centavos,
            mediaUrl: normalizeImageUrl(service.foto_url)
        }), { emptyMessage: 'Nenhum serviço disponível.' });
    }

    function renderProfessionals() {
        if (!professionalsGrid) return;
        renderCardList(professionalsGrid, state.professionals, (pro) =>
            createProfessionalCardComponent({
                name: pro.nome_profissional || pro.nome,
                bio: pro.bio || pro.especialidade,
                mediaUrl: normalizeImageUrl(pro.foto_url),
                onClick: () => showBarberProfile(pro.id)
            }), { emptyMessage: 'Nenhum barbeiro disponível no momento.' });
    }

    async function showBarberProfile(id) {
        const pro = state.professionals.find(p => p.id === id);
        if (!pro) return;

        state.selectedProfessional = pro;
        state.selectedServices = []; // Reset services
        state.selectedTime = null;
        state.selectedDate = null; // Reset date

        profileName.innerText = pro.nome_profissional || pro.nome;
        profileSpecialty.innerText = pro.bio || pro.especialidade || 'Barbeiro Profissional';

        try {
            state.services = await services.fetchServices(pro.id);
        } catch (error) {
            state.services = [];
        }

        const profileHeader = document.querySelector('.profile-header');
        const oldAvatar = document.querySelector('.profile-avatar, .profile-avatar-wrapper');
        if (oldAvatar) oldAvatar.remove();

        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'profile-avatar-wrapper';
        const avatar = createMedia({
            url: normalizeImageUrl(pro.foto_url),
            alt: pro.nome_profissional || pro.nome,
            icon: 'person',
            className: 'profile-avatar',
            imgClass: 'barber-avatar-img'
        });
        avatar.classList.add('profile-avatar-surface');
        wrapperDiv.appendChild(avatar);
        profileHeader.insertBefore(wrapperDiv, profileHeader.firstChild);

        renderProfileServices();
        renderDateSelector(); // New Date Picker
        renderProfileTimeSlots([], 'Selecione serviços e data');

        const mainViews = ['hero', 'professionals', 'services', 'about', 'appointments'];
        mainViews.forEach(id => document.getElementById(id)?.classList.add('hidden'));

        barberProfileView.classList.remove('hidden');
        window.scrollTo(0, 0);
        updateBookingPreview(); // Initialize preview
        checkBookingReady();
    }

    function renderProfileServices() {
        profileServicesList.replaceChildren();
        if (!state.services || state.services.length === 0) {
            renderStatus(profileServicesList, 'Nenhum serviço disponível.', 'placeholder-text');
            return;
        }

        state.services.forEach(service => {
            const isSelected = state.selectedServices.some(s => s.id === service.id);
            const card = createProfileServiceCardComponent({
                service,
                selected: isSelected,
                mediaUrl: normalizeImageUrl(service.foto_url),
                onSelect: () => toggleServiceSelection(service)
            });
            profileServicesList.appendChild(card);
        });
    }

    function toggleServiceSelection(service) {
        const idx = state.selectedServices.findIndex(s => s.id === service.id);
        if (idx >= 0) {
            state.selectedServices.splice(idx, 1);
        } else {
            state.selectedServices.push(service);
        }

        state.selectedTime = null; // Clear time when services change
        renderProfileServices();
        checkBookingReady();

        if (state.selectedDate) {
            if (state.calcTimeout) clearTimeout(state.calcTimeout);

            if (state.selectedServices.length > 0) {
                renderStatus(profileTimeSlots, 'Calculando...', 'placeholder-text');
            } else {
                renderProfileTimeSlots([], 'Selecione pelo menos um serviço.');
                return;
            }

            state.calcTimeout = setTimeout(() => {
                loadProfileTimeSlots();
            }, 600);
        }
        updateBookingPreview();
    }

    function updateBookingPreview() {
        const container = document.getElementById('booking-preview-summary');
        if (!container) return;

        container.replaceChildren();

        if (state.selectedServices.length === 0) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'flex';

        // 1. Services List
        state.selectedServices.forEach(s => {
            const row = document.createElement('div');
            row.className = 'preview-row';
            const name = document.createElement('span');
            name.innerText = s.nome;
            const price = document.createElement('span');
            price.innerText = formatCurrency(s.preco_centavos);
            row.appendChild(name);
            row.appendChild(price);
            container.appendChild(row);
        });

        // 2. Booking Fee (Mocked/Optional, keeping simple based on services for now)
        // Reference image has "Booking Fee". We can add if desired, but 0 for now.

        // 3. Total
        const totalValue = state.selectedServices.reduce((acc, s) => acc + s.preco_centavos, 0);
        const totalRow = document.createElement('div');
        totalRow.className = 'preview-total';

        const labelCol = document.createElement('div');
        labelCol.className = 'col';
        const label = document.createElement('div');
        label.className = 'label';
        label.innerText = 'TOTAL A PAGAR';

        const durationText = document.createElement('div');
        durationText.className = 'label';
        durationText.style.fontSize = '0.7rem';
        durationText.style.marginTop = '0.2rem';
        const totalDuration = state.selectedServices.reduce((acc, s) => acc + (s.duracao_minutos || 30), 0);
        durationText.innerText = `${totalDuration} MIN TOTAL`;

        labelCol.appendChild(label);
        labelCol.appendChild(durationText);

        const value = document.createElement('div');
        value.className = 'value';
        value.innerText = formatCurrency(totalValue);

        totalRow.appendChild(labelCol);
        totalRow.appendChild(value);
        container.appendChild(totalRow);
    }

    // --- New Date Picker Logic ---
    function renderDateSelector() {
        const container = document.getElementById('profile-date-selector');
        if (!container) return; // Should exist from app-components

        container.replaceChildren();

        const today = new Date();
        const days = [];
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

        for (let i = 0; i < 15; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push(d);
        }

        days.forEach(dateObj => {
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            const isSelected = state.selectedDate === dateStr;
            const dayOfWeek = dateObj.getDay();

            // Disable sundays (0) or strict implementation rule if needed. For now enabling all.
            // Actually, usually barber shops close on Sundays or Mondays. Let's keep it open or check logic?
            // Assuming open for now, blocked by backend if needed.

            const card = document.createElement('div');
            card.className = `date-card ${isSelected ? 'selected' : ''}`;
            card.onclick = () => {
                if (state.selectedDate === dateStr) return;
                state.selectedDate = dateStr;
                state.selectedTime = null;
                renderDateSelector(); // re-render to update selected class
                loadProfileTimeSlots();
                checkBookingReady();
            };

            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.innerText = dayNames[dayOfWeek];

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.innerText = dd;

            const month = document.createElement('div');
            month.className = 'month-name';
            month.innerText = monthNames[dateObj.getMonth()];

            card.appendChild(dayName);
            card.appendChild(dayNumber);
            card.appendChild(month);
            container.appendChild(card);
        });
    }

    async function loadProfileTimeSlots() {
        if (!state.selectedProfessional || !state.selectedDate) return;
        if (state.selectedServices.length === 0) {
            renderProfileTimeSlots([], 'Selecione pelo menos um serviço.');
            return;
        }

        renderStatus(profileTimeSlots, 'Calculando horários...', 'placeholder-text');
        try {
            const servicosIds = state.selectedServices.map(s => s.id);
            const result = await services.fetchAvailableServiceSlots(
                state.selectedProfessional.id,
                state.selectedDate,
                servicosIds
            );

            // result = { horarios: [], duracaoTotal: number }
            renderProfileTimeSlots(result.horarios || []);
        } catch (error) {
            renderStatus(profileTimeSlots, 'Erro ao carregar horários.', 'placeholder-text');
        }
    }

    function renderProfileTimeSlots(slots, emptyMsg = 'Sem horários disponíveis.') {
        if (!slots || slots.length === 0) {
            renderStatus(profileTimeSlots, emptyMsg, 'placeholder-text');
            return;
        }

        profileTimeSlots.replaceChildren();
        slots.forEach((inicioIso) => {
            const label = formatTimeSlot(inicioIso);
            const item = createTimeSlotComponent({
                label,
                selected: state.selectedTime === inicioIso,
                onClick: () => {
                    state.selectedTime = inicioIso;
                    // Simplify: just re-render slots to update selected class
                    // (Or optimize later)
                    Array.from(profileTimeSlots.children).forEach(c => c.classList.remove('selected'));
                    item.classList.add('selected');
                    checkBookingReady();
                }
            });
            profileTimeSlots.appendChild(item);
        });
    }

    function checkBookingReady() {
        const ready = state.selectedServices.length > 0 && state.selectedProfessional && state.selectedDate && state.selectedTime;
        btnStartBooking.disabled = false;
        btnStartBooking.classList.toggle('is-disabled', !ready);
        btnStartBooking.setAttribute('aria-disabled', (!ready).toString());
    }

    function goToWizardStep(step) {
        wizardSteps.forEach(s => s.classList.remove('active'));
        const target = Array.from(wizardSteps).find(s => s.dataset.step == step);
        if (target) {
            target.classList.add('active');
            state.currentStep = step;
            if (step === 2) renderSummary();
        }
    }

    function renderSummary() {
        bookingSummary.replaceChildren();
        const dateText = `${formatDateBR(state.selectedTime)} às ${formatTimeSlot(state.selectedTime)}`;

        const serviceNames = state.selectedServices.map(s => s.nome).join(', ');
        const totalValue = state.selectedServices.reduce((acc, s) => acc + s.preco_centavos, 0);

        const { summary, note } = createBookingSummaryComponent({
            professional: state.selectedProfessional.nome_profissional || state.selectedProfessional.nome,
            service: serviceNames,
            dateText,
            totalText: formatCurrency(totalValue),
            note: 'Pagamento e confirmação serão feitos no local.'
        });
        bookingSummary.appendChild(summary);
        bookingSummary.appendChild(note);
    }

    function showNotification(message, type = 'success') {
        if (window.NOTIFY?.notify) {
            window.NOTIFY.notify(message, type, { containerId: 'notification-container' });
            return;
        }
        const container = document.getElementById('notification-container');
        const note = document.createElement('div');
        note.className = `notification ${type}`;
        note.innerText = message;
        container.appendChild(note);
        setTimeout(() => { note.style.opacity = '0'; setTimeout(() => note.remove(), 300); }, 3000);
    }

    // --- Events ---
    function setupEventListeners() {
        closeProfileBtn.onclick = () => {
            // Keep section visibility consistent with normal "home" navigation.
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('home');
            } else {
                barberProfileView.classList.add('hidden');
                document.getElementById('hero')?.classList.remove('hidden');
                document.getElementById('professionals')?.classList.remove('hidden');
                document.getElementById('services')?.classList.remove('hidden');
                document.getElementById('about')?.classList.add('hidden');
            }
        };

        btnStartBooking.onclick = () => {
            if (!state.selectedServices.length || !state.selectedDate || !state.selectedTime) {
                const msg = !state.selectedServices.length && !state.selectedDate && !state.selectedTime
                    ? 'Selecione um serviço, um dia e um horário antes de agendar.'
                    : !state.selectedServices.length
                        ? 'Selecione pelo menos um serviço antes de agendar.'
                        : !state.selectedDate
                            ? 'Selecione um dia antes de agendar.'
                            : 'Selecione um horário antes de agendar.';
                showNotification(msg, 'error');
                return;
            }

            barberProfileView.classList.add('hidden');
            bookingWizardView.classList.remove('hidden');
            goToWizardStep(1);
            renderSummary();
        };

        cancelBookingBtn.onclick = () => {
            bookingWizardView.classList.add('hidden');
            barberProfileView.classList.remove('hidden');
        };

        confirmBtn.addEventListener('click', async () => {
            if (!state.selectedServices.length || !state.selectedDate || !state.selectedTime) {
                const msg = !state.selectedServices.length && !state.selectedDate && !state.selectedTime
                    ? 'Selecione um serviço, um dia e um horário antes de confirmar.'
                    : !state.selectedServices.length
                        ? 'Selecione pelo menos um serviço antes de confirmar.'
                        : !state.selectedDate
                            ? 'Selecione um dia antes de confirmar.'
                            : 'Selecione um horário antes de confirmar.';
                showNotification(msg, 'error');
                return;
            }
            try {
                confirmBtn.disabled = true;
                confirmBtn.innerText = 'Processando...';

                const payload = {
                    barbeiro_id: state.selectedProfessional.id,
                    inicio_desejado: state.selectedTime,
                    servicos: state.selectedServices.map(s => s.id) // Send array of IDs
                };

                try {
                    await services.createAppointment(payload);
                    showNotification('Solicitação enviada! Aguarde a confirmação.');
                    setTimeout(() => {
                        bookingWizardView.classList.add('hidden');
                        window.navigateTo('home');
                        sessionStorage.removeItem('barber_booking_state'); // Clear state on success
                        confirmBtn.disabled = false;
                        confirmBtn.innerText = 'Confirmar Agora';
                    }, 2500);
                } catch (err) {
                    showNotification('Erro: ' + err.message, 'error');
                    confirmBtn.disabled = false;
                    confirmBtn.innerText = 'Confirmar Agora';
                }
            } catch (error) {
                console.error(error);
            }
        });

        // CTA Button in Hero
        const ctaBtn = document.querySelector('.cta-button');
        if (ctaBtn) {
            ctaBtn.onclick = (e) => {
                e.preventDefault();
                const el = document.getElementById('professionals');
                window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
            };
        }

        // "Ver Serviços" button in Hero
        const servicesBtn = document.querySelector('.nav-button-hero');
        if (servicesBtn) {
            servicesBtn.onclick = (e) => {
                e.preventDefault();
                const el = document.getElementById('services');
                if (!el) return;
                window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
            };
        }

        // Mobile Menu Toggle
        if (menuToggle && navMenu) {
            const closeMobileMenu = () => {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
                const icon = menuToggle.querySelector('.material-icons');
                if (icon) icon.innerText = 'menu';
            };

            menuToggle.onclick = () => {
                const willOpen = !navMenu.classList.contains('active');
                navMenu.classList.toggle('active', willOpen);
                menuToggle.setAttribute('aria-expanded', String(willOpen));
                document.body.classList.toggle('menu-open', willOpen);
                const icon = menuToggle.querySelector('.material-icons');
                if (icon) icon.innerText = willOpen ? 'close' : 'menu';
            };
            navMenu.querySelectorAll('.nav-link, .nav-button').forEach(link => {
                link.addEventListener('click', () => {
                    closeMobileMenu();
                });
            });

            document.addEventListener('click', (event) => {
                if (window.innerWidth > 960) return;
                const target = event.target;
                if (!(target instanceof Element)) return;
                if (!navMenu.classList.contains('active')) return;
                if (target.closest('#menu-toggle') || target.closest('#nav-menu')) return;
                closeMobileMenu();
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth > 960) closeMobileMenu();
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') closeMobileMenu();
            });
        }

        // Logout
        document.addEventListener('click', (e) => {
            const authBtn = e.target.closest('#auth-action');
            if (!authBtn) return;
            if (state.isLoggedIn) {
                e.preventDefault();
                document.cookie = 'client_token=; Max-Age=0; path=/; SameSite=Lax';
                window.location.href = `${BASE_PATH}/login`;
            }
        });

        const reviewsTrack = document.getElementById('reviews-track');
    }

    async function renderAppointments() {
        if (!appointmentsList) return;
        renderLoading(appointmentsList, 'Buscando seus agendamentos...');
        try {
            const appointments = await services.fetchUserAppointments();
            renderCardList(appointmentsList, appointments, buildAppointmentCard, { emptyMessage: 'Você ainda não possui agendamentos.' });
        } catch (error) {
            renderStatus(appointmentsList, 'Erro ao carregar agendamentos.');
        }
    }

    function buildAppointmentCard(appt) {
        // ... (Keep existing logic or simplified version)
        // Re-implementing simplified logic to avoid huge file size issues if needed, strictly copying previous logic
        const barbeiroNome = appt.barbeiro?.nome_profissional || appt.barbeiro?.nome || `#${appt.barbeiro_id}`;
        const servico = appt.servicos?.[0];
        const servicoNome = appt.servicos?.map(s => s.nome).join(', ') || 'Serviço';
        const originalCentavos = appt.valor_original_centavos ?? 0;
        const descontoCentavos = appt.desconto_aplicado_centavos ?? 0;
        const finalCentavos = appt.valor_total_centavos ?? Math.max(0, originalCentavos - descontoCentavos);
        const dataFmt = formatDateBR(appt.inicio);
        const horaFmt = formatTimeBR(appt.inicio);

        const onCancel = async (_evt, btnRef) => {
            const id = Number(appt.id);
            if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
            try {
                const targetBtn = btnRef;
                if (targetBtn) { targetBtn.disabled = true; targetBtn.innerText = 'Cancelando...'; }
                await services.deleteAppointment(id);
                showNotification('Agendamento cancelado com sucesso!');
                renderAppointments();
            } catch (error) {
                showNotification('Erro ao cancelar: ' + error.message, 'error');
                if (btnRef) { btnRef.disabled = false; btnRef.innerText = 'Cancelar reserva'; }
            }
        };

        const card = createAppointmentCardComponent({
            title: barbeiroNome,
            status: appt.status,
            serviceName: servicoNome,
            dateText: `${dataFmt} às ${horaFmt}`,
            priceText: formatCurrency(finalCentavos),
            originalPriceText: formatCurrency(originalCentavos),
            discountText: formatCurrency(descontoCentavos),
            finalPriceText: formatCurrency(finalCentavos),
            cancelLabel: getAppointmentStatusLabel(appt.status),
            canCancel: appt.status === 'AGENDADO' || appt.status === 'SOLICITADO',
            onCancel: (evt, btn) => onCancel(evt, btn)
        });
        return card;
    }

    function getAppointmentStatusLabel(status) {
        if (status === 'SOLICITADO') return 'Cancelar solicitação';
        if (status === 'AGENDADO') return 'Cancelar reserva';
        if (status === 'RECUSADO') return 'Recusado';
        if (status === 'CONCLUIDO') return 'Concluído';
        return 'Cancelado';
    }
});
