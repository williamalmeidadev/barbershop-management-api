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
        selectedService: null,
        selectedProfessional: null,
        selectedDate: null,
        selectedTime: null,
        customerName: '',
        customerPhone: '',
        currentStep: 1,
        token: clientTokenCookie ? decodeURIComponent(clientTokenCookie) : null,
        isLoggedIn: !!clientTokenCookie
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
    const profileBookingDate = document.getElementById('profile-booking-date');
    const profileTimeSlots = document.getElementById('profile-time-slots');
    const btnStartBooking = document.getElementById('btn-start-booking');

    // Wizard Elements
    const cancelBookingBtn = document.getElementById('cancel-booking');
    const bookingSummary = document.getElementById('booking-summary');
    const confirmBtn = document.getElementById('confirm-booking');
    const wizardSteps = document.querySelectorAll('.wizard-step');

    // --- Initialization ---
    init();

    async function init() {
        await loadInitialData();
        
        renderProfessionals();
        renderServices();
        
        setupNavigation();
        setupEventListeners();

        const today = new Date().toISOString().split('T')[0];
        if (profileBookingDate) profileBookingDate.min = today;

        updateAuthUI();
    }

    function updateAuthUI() {
        console.log('Updating Auth UI. IsLoggedIn:', state.isLoggedIn);
        if (state.isLoggedIn) {
            if (navAppointments) navAppointments.classList.remove('hidden');
            const authBtn = document.getElementById('auth-action');
            if (authBtn) {
                authBtn.innerText = 'Sair';
                authBtn.href = "#";
            }
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

    // --- Navigation Logic ---
    function setupNavigation() {
        const views = {
            home: ['hero', 'professionals', 'services'],
            about: ['about'],
            appointments: ['appointments']
        };

        window.navigateTo = function(viewName) {
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

            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            const activeLink = document.getElementById(`nav-${viewName}`);
            if (activeLink) activeLink.classList.add('active');

            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }

            window.scrollTo(0, 0);
        };

        document.getElementById('nav-home')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.navigateTo('home');
        });

        document.getElementById('nav-about')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.navigateTo('about');
        });

        document.getElementById('nav-appointments')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.navigateTo('appointments');
        });

        const hash = window.location.hash;
        if (hash === '#about') {
            window.navigateTo('about');
        } else if (hash === '#appointments') {
            window.navigateTo('appointments');
        } else {
            window.navigateTo('home');
        }
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
        }), {
            emptyMessage: 'Nenhum serviço disponível.'
        });
    }

    function renderProfessionals() {
        if (!professionalsGrid) return;
        renderCardList(professionalsGrid, state.professionals, (pro) =>
            createProfessionalCardComponent({
                name: pro.nome_profissional || pro.nome,
                bio: pro.bio || pro.especialidade,
                mediaUrl: normalizeImageUrl(pro.foto_url),
                onClick: () => showBarberProfile(pro.id)
            }), {
            emptyMessage: 'Nenhum barbeiro disponível no momento.'
        });
    }

    async function showBarberProfile(id) {
        const pro = state.professionals.find(p => p.id === id);
        if (!pro) return;

        state.selectedProfessional = pro;
        state.selectedService = null;
        state.selectedTime = null;
        state.selectedDate = null;
        if (profileBookingDate) profileBookingDate.value = '';

        profileName.innerText = pro.nome_profissional || pro.nome;
        profileSpecialty.innerText = pro.bio || pro.especialidade || 'Barbeiro Profissional';

        try {
            state.services = await services.fetchServices(pro.id);
        } catch (error) {
            console.error('Falha ao carregar serviços do barbeiro', error);
            state.services = [];
        }

        const profileHeader = document.querySelector('.profile-header');

        const oldAvatar = document.querySelector('.profile-avatar, .profile-avatar-wrapper');
        if (oldAvatar) oldAvatar.remove();

        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'profile-avatar-wrapper';
        const avatarSrc = normalizeImageUrl(pro.foto_url);
        const avatar = createMedia({
            url: avatarSrc,
            alt: pro.nome_profissional || pro.nome || 'Barbeiro',
            icon: 'person',
            className: 'profile-avatar',
            imgClass: 'barber-avatar-img'
        });
        avatar.classList.add('profile-avatar-surface');
        wrapperDiv.appendChild(avatar);

        profileHeader.insertBefore(wrapperDiv, profileHeader.firstChild);

        renderProfileServices();
        renderProfileTimeSlots([]);

        const mainViews = ['hero', 'professionals', 'services', 'about', 'appointments'];
        mainViews.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.add('hidden');
        });
        
        barberProfileView.classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    function renderProfileServices() {
        profileServicesList.replaceChildren();
        if (!state.services || state.services.length === 0) {
            renderStatus(profileServicesList, 'Nenhum serviço disponível para este barbeiro.', 'placeholder-text');
            return;
        }

        state.services.forEach(service => {
            const mediaSrc = normalizeImageUrl(service.foto_url);
            const card = createProfileServiceCardComponent({
                service,
                selected: state.selectedService?.id === service.id,
                mediaUrl: mediaSrc,
                onSelect: () => {
                    state.selectedService = service;
                    renderProfileServices();
                    checkBookingReady();
                }
            });

            profileServicesList.appendChild(card);
        });
    }

    async function renderAppointments() {
        if (!appointmentsList) return;
        renderLoading(appointmentsList, 'Buscando seus agendamentos...');

        try {
            const appointments = await services.fetchUserAppointments();
            renderCardList(appointmentsList, appointments, buildAppointmentCard, {
                emptyMessage: 'Você ainda não possui agendamentos.'
            });
        } catch (error) {
            renderStatus(appointmentsList, 'Erro ao carregar agendamentos.');
        }
    }

    function getAppointmentStatusLabel(status) {
        if (status === 'SOLICITADO') return 'Cancelar solicitação';
        if (status === 'AGENDADO') return 'Cancelar reserva';
        if (status === 'RECUSADO') return 'Recusado';
        if (status === 'CONCLUIDO') return 'Concluído';
        return 'Cancelado';
    }

    function buildAppointmentCard(appt) {
        const barbeiroNome = appt.barbeiro?.nome_profissional || appt.barbeiro?.nome || `#${appt.barbeiro_id}`;
        const servico = appt.servicos?.[0];
        const servicoNome = servico?.nome || 'Serviço';
        const originalCentavos = appt.valor_original_centavos ?? servico?.preco_centavos ?? 0;
        const descontoCentavos = appt.desconto_aplicado_centavos ?? 0;
        const finalCentavos = appt.valor_total_centavos ?? Math.max(0, originalCentavos - descontoCentavos);
        const dataFmt = formatDateBR(appt.inicio);
        const horaFmt = formatTimeBR(appt.inicio);
        const cancelLabel = getAppointmentStatusLabel(appt.status);
        const canCancel = appt.status === 'AGENDADO' || appt.status === 'SOLICITADO';
        const onCancel = async (_evt, btnRef) => {
            const id = Number(appt.id);
            if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
            try {
                const targetBtn = btnRef || cancelButtonRef;
                if (targetBtn) {
                    targetBtn.disabled = true;
                    targetBtn.innerText = 'Cancelando...';
                }
                await services.deleteAppointment(id);
                showNotification('Agendamento cancelado com sucesso!');
                renderAppointments();
            } catch (error) {
                showNotification('Erro ao cancelar: ' + error.message, 'error');
                const targetBtn = btnRef || cancelButtonRef;
                if (targetBtn) {
                    targetBtn.disabled = false;
                    targetBtn.innerText = 'Cancelar reserva';
                }
            }
        };

        let cancelButtonRef = null;
        const card = createAppointmentCardComponent({
            title: barbeiroNome,
            status: appt.status,
            serviceName: servicoNome,
            dateText: `${dataFmt} às ${horaFmt}`,
            priceText: formatCurrency(finalCentavos),
            originalPriceText: formatCurrency(originalCentavos),
            discountText: formatCurrency(descontoCentavos),
            finalPriceText: formatCurrency(finalCentavos),
            cancelLabel,
            canCancel,
            onCancel: (evt, btn) => {
                cancelButtonRef = btn || evt?.currentTarget || cancelButtonRef;
                onCancel(evt, btn);
            }
        });
        card.dataset.id = String(appt.id);
        return card;
    }

    async function loadProfileTimeSlots() {
        if (!state.selectedProfessional || !state.selectedDate) return;

        renderStatus(profileTimeSlots, 'Buscando horários...', 'placeholder-text');
        try {
            const slots = await services.fetchAvailableSlots(state.selectedProfessional.id, state.selectedDate);
            renderProfileTimeSlots(slots);
        } catch (error) {
            renderStatus(profileTimeSlots, 'Erro ao carregar horários.', 'placeholder-text');
        }
    }

    function renderProfileTimeSlots(slots) {
        if (slots.length === 0) {
            renderStatus(
                profileTimeSlots,
                state.selectedDate ? 'Sem horários para esta data.' : 'Selecione uma data para ver os horários',
                'placeholder-text'
            );
            return;
        }

        profileTimeSlots.replaceChildren();
        slots.forEach((slot) => {
            const inicioIso = slot.inicio;
            const label = formatTimeSlot(inicioIso);
            const item = createTimeSlotComponent({
                label,
                selected: state.selectedTime === inicioIso,
                onClick: () => {
                    state.selectedTime = inicioIso;
                    renderProfileTimeSlots(slots);
                    checkBookingReady();
                }
            });
            item.dataset.time = inicioIso;
            profileTimeSlots.appendChild(item);
        });
    }

    function checkBookingReady() {
        const ready = state.selectedService && state.selectedProfessional && state.selectedDate && state.selectedTime;
        btnStartBooking.disabled = !ready;
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
        const { summary, note } = createBookingSummaryComponent({
            professional: state.selectedProfessional.nome_profissional || state.selectedProfessional.nome,
            service: state.selectedService.nome,
            dateText,
            totalText: formatCurrency(state.selectedService.preco_centavos),
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
        if (ui.toast) {
            ui.toast(container, message, { type, classBase: 'notification', duration: 3000 });
            return;
        }
        const note = document.createElement('div');
        note.className = `notification ${type}`;
        note.innerText = message;
        container.appendChild(note);

        setTimeout(() => {
            note.style.opacity = '0';
            setTimeout(() => note.remove(), 300);
        }, 3000);
    }

    // --- Events ---
    function setupEventListeners() {
        closeProfileBtn.onclick = () => {
            barberProfileView.classList.add('hidden');
            document.getElementById('hero').classList.remove('hidden');
            document.getElementById('professionals').classList.remove('hidden');
            document.getElementById('services').classList.remove('hidden');
        };

        profileBookingDate.addEventListener('change', (e) => {
            state.selectedDate = e.target.value;
            state.selectedTime = null;
            loadProfileTimeSlots();
            checkBookingReady();
        });

        btnStartBooking.onclick = () => {
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
            try {
                confirmBtn.disabled = true;
                confirmBtn.innerText = 'Processando...';

                const payload = {
                    barbeiro_id: state.selectedProfessional.id,
                    inicio_desejado: state.selectedTime,
                    servicos: [state.selectedService.id]
                };

                try {
                    await services.createAppointment(payload);
                    showNotification('Solicitação enviada! Aguarde a confirmação.');

                    setTimeout(() => {
                        bookingWizardView.classList.add('hidden');
                        window.navigateTo('home');
                        // Reset
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

        // Mobile Menu Toggle
        if (menuToggle && navMenu) {
            menuToggle.onclick = () => {
                navMenu.classList.toggle('active');
                const icon = menuToggle.querySelector('.material-icons');
                if (icon) {
                    icon.innerText = navMenu.classList.contains('active') ? 'close' : 'menu';
                }
            };

            // Close menu when clicking links
            navMenu.querySelectorAll('.nav-link, .nav-button').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    const icon = menuToggle.querySelector('.material-icons');
                    if (icon) icon.innerText = 'menu';
                });
            });
        }

        // Logout functionality
        document.addEventListener('click', (e) => {
            const authBtn = e.target.closest('#auth-action');
            if (!authBtn) return;

            const token = getCookieValue ? getCookieValue('client_token') : null;
            if (token) {
                e.preventDefault();
                console.log('Logout clicked. Clearing session...');
                console.log('Session cleared. Redirecting to login...');
                document.cookie = 'client_token=; Max-Age=0; path=/; SameSite=Lax';
                window.location.href = `${BASE_PATH}/login`;
            }
        });
    }
});
