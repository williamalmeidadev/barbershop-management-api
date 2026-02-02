const BASE_PATH = window.BASE_PATH || '';
const ui = window.UI || {};
const formatCurrency = ui.formatCurrency || ((centavos) => {
    const value = Number(centavos || 0) / 100;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
});
const el = ui.el || ((tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
});
const createCard = ui.createCard || ((className = 'card') => {
    const card = document.createElement('div');
    card.className = className;
    return card;
});
const createButton = ui.createButton || ((label, className = 'btn') => {
    const btn = document.createElement('button');
    btn.className = className;
    btn.textContent = label;
    return btn;
});
const createActionsRow = ui.createActionsRow || ((actions = [], className = 'card-actions') => {
    const row = document.createElement('div');
    row.className = className;
    actions.forEach((btn) => btn && row.appendChild(btn));
    return row;
});
const createCardWithLines = ui.createCardWithLines || (({ title, lines = [], actions = [], className = 'card', titleTag = 'strong' }) => {
    const card = createCard(className);
    if (title) {
        const titleEl = document.createElement(titleTag);
        titleEl.textContent = title;
        card.appendChild(titleEl);
    }
    lines.forEach((text) => {
        const line = document.createElement('small');
        line.textContent = text;
        card.appendChild(line);
    });
    if (actions.length) card.appendChild(createActionsRow(actions));
    return card;
});
const createInfoRow = ui.createInfoRow || ((label, value) => {
    const row = document.createElement('div');
    row.className = 'info-row';
    const l = document.createElement('strong');
    l.textContent = label;
    const v = document.createElement('span');
    v.textContent = value;
    row.appendChild(l);
    row.appendChild(v);
    return row;
});
const createIcon = ui.createIcon || ((name, className = 'material-icons') => {
    const icon = document.createElement('span');
    icon.className = className;
    icon.textContent = name;
    return icon;
});
const createBadge = ui.createBadge || ((text, className = 'badge') => {
    const badge = document.createElement('span');
    badge.className = className;
    badge.textContent = text;
    return badge;
});
const createCardWithHeader = ui.createCardWithHeader || ((opts = {}) => {
    const card = createCard(opts.className || 'card');
    const header = document.createElement('div');
    header.className = opts.headerClass || 'card-header';
    const titleWrap = document.createElement('div');
    titleWrap.className = opts.titleClass || 'card-title';
    if (opts.icon) titleWrap.appendChild(createIcon(opts.icon));
    if (opts.title) {
        const t = document.createElement('span');
        t.textContent = opts.title;
        titleWrap.appendChild(t);
    }
    header.appendChild(titleWrap);
    card.appendChild(header);
    return { card, header, titleWrap };
});
const createMedia = ui.createMedia || (({ url, alt = '', icon = 'image', className = 'media', imgClass } = {}) => {
    const wrap = document.createElement('div');
    wrap.className = className;
    if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = alt;
        if (imgClass) img.className = imgClass;
        img.onerror = () => {
            const fallback = document.createElement('span');
            fallback.className = 'material-icons';
            fallback.textContent = icon;
            wrap.replaceChildren(fallback);
        };
        wrap.appendChild(img);
        return wrap;
    }
    const fallback = document.createElement('span');
    fallback.className = 'material-icons';
    fallback.textContent = icon;
    wrap.appendChild(fallback);
    return wrap;
});
const renderStatus = ui.renderStatus || ((container, message, className = 'status') => {
    if (!container) return;
    container.replaceChildren();
    const node = document.createElement('div');
    node.className = className;
    node.textContent = message;
    container.appendChild(node);
});
const renderLoading = ui.renderLoading || ((container, message = 'Carregando...') => {
    renderStatus(container, message, 'loading');
});
const renderCardList = ui.renderCardList || ((container, items, renderItem, { emptyMessage = 'Sem dados.' } = {}) => {
    if (!container) return;
    container.replaceChildren();
    if (!items || items.length === 0) {
        renderStatus(container, emptyMessage);
        return;
    }
    items.forEach((item) => {
        const node = renderItem(item);
        if (node) container.appendChild(node);
    });
});

function getCookieValue(name) {
    return document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${name}=`))
        ?.split('=')[1];
}

const clientTokenCookie = getCookieValue('client_token');
const localToken = localStorage.getItem('token');
if (!clientTokenCookie && !localToken) {
    window.location.replace(`${BASE_PATH}/login`);
}

function normalizeImageUrl(url) {
    if (!url) return '';
    if (url.startsWith(`${BASE_PATH}/`)) return url;
    if (url.startsWith('/images/')) return `${BASE_PATH}${url}`;
    if (url.includes('/images/')) {
        const idx = url.indexOf('/images/');
        return `${BASE_PATH}${url.slice(idx)}`;
    }
    return url;
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
        token: localStorage.getItem('token') || null,
        isLoggedIn: !!localStorage.getItem('token')
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

        renderCardList(servicesGrid, state.allServices, buildServiceCard, {
            emptyMessage: 'Nenhum serviço disponível.'
        });
    }

    function buildServiceCard(service) {
        const card = createCard('card service-card');

        const mediaSrc = normalizeImageUrl(service.foto_url);
        const mediaWrap = createMedia({
            url: mediaSrc,
            alt: service.nome,
            icon: 'content_cut',
            className: 'service-media-app'
        });

        const title = document.createElement('h3');
        title.className = 'centered-title';
        title.textContent = service.nome;

        const desc = document.createElement('p');
        desc.className = 'centered-muted';
        desc.textContent = service.descricao || 'Procedimento realizado com os melhores produtos do mercado.';

        const footer = document.createElement('div');
        footer.className = 'service-meta';

        const duration = document.createElement('div');
        duration.className = 'service-duration';
        duration.appendChild(createIcon('schedule'));
        duration.appendChild(document.createTextNode(` ${service.duracao_minutos} min`));

        const price = document.createElement('div');
        price.className = 'service-price';
        price.textContent = formatCurrency(service.preco_centavos);

        footer.appendChild(duration);
        footer.appendChild(price);

        card.appendChild(mediaWrap);
        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(footer);

        return card;
    }

    function renderProfessionals() {
        if (!professionalsGrid) return;
        renderCardList(professionalsGrid, state.professionals, buildProfessionalCard, {
            emptyMessage: 'Nenhum barbeiro disponível no momento.'
        });
    }

    function buildProfessionalCard(pro) {
        const card = createCard('card');
        card.dataset.id = String(pro.id);

        const avatarSrc = normalizeImageUrl(pro.foto_url);
        const avatar = createMedia({
            url: avatarSrc,
            alt: pro.nome_profissional || pro.nome || 'Barbeiro',
            icon: 'person',
            className: 'avatar-container',
            imgClass: 'barber-avatar-img'
        });

        const name = document.createElement('h3');
        name.className = 'centered-title';
        name.textContent = pro.nome_profissional || pro.nome;

        const bio = document.createElement('p');
        bio.className = 'centered-muted';
        bio.textContent = pro.bio || pro.especialidade || 'Barbeiro Profissional';

        const ctaWrap = document.createElement('div');
        ctaWrap.className = 'centered-cta';
        const cta = document.createElement('span');
        cta.textContent = 'Ver Serviços e Horários';
        ctaWrap.appendChild(cta);

        card.appendChild(avatar);
        card.appendChild(name);
        card.appendChild(bio);
        card.appendChild(ctaWrap);

        card.onclick = () => showBarberProfile(pro.id);
        return card;
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
            const card = createCard(`profile-service-card ${state.selectedService?.id === service.id ? 'selected' : ''}`);
            card.dataset.id = String(service.id);

            const mediaSrc = normalizeImageUrl(service.foto_url);
            const mediaWrap = createMedia({
                url: mediaSrc,
                alt: service.nome,
                icon: 'content_cut',
                className: 'profile-service-media'
            });

            const info = document.createElement('div');
            info.className = 'profile-service-info';
            const name = document.createElement('h4');
            name.textContent = service.nome;
            const desc = document.createElement('p');
            desc.textContent = service.descricao || 'Serviço de alta qualidade';
            info.appendChild(name);
            info.appendChild(desc);

            const price = document.createElement('div');
            price.className = 'profile-service-price';
            const priceValue = document.createElement('span');
            priceValue.textContent = formatCurrency(service.preco_centavos);
            const duration = document.createElement('p');
            duration.textContent = `${service.duracao_minutos || 30} min`;
            price.appendChild(priceValue);
            price.appendChild(duration);

            card.appendChild(mediaWrap);
            card.appendChild(info);
            card.appendChild(price);

            profileServicesList.appendChild(card);
        });

        profileServicesList.querySelectorAll('.profile-service-card').forEach(card => {
            card.onclick = () => {
                const sid = parseInt(card.dataset.id);
                state.selectedService = state.services.find(s => s.id === sid);
                renderProfileServices();
                checkBookingReady();
            };
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
        const servicoPreco = servico?.preco_centavos ?? appt.valor_total_centavos ?? 0;
        const dataHora = new Date(appt.inicio);
        const dataFmt = dataHora.toLocaleDateString('pt-BR');
        const horaFmt = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                const { card, header } = createCardWithHeader({
                    title: barbeiroNome,
                    icon: 'content_cut',
                    className: 'appointment-card',
                    headerClass: 'appointment-header',
                    titleClass: 'appointment-title',
                    statusClass: 'appointment-status'
                });
                card.dataset.id = String(appt.id);
                header.appendChild(createBadge(appt.status, 'appointment-status'));

        const details = document.createElement('div');
        details.className = 'appointment-details';
        details.appendChild(createInfoRow('Serviço:', servicoNome));
        details.appendChild(createInfoRow('Data:', `${dataFmt} às ${horaFmt}`));

        const price = document.createElement('div');
        price.className = 'appointment-price';
        price.textContent = formatCurrency(servicoPreco);

        const cancelBtn = createButton(getAppointmentStatusLabel(appt.status), 'btn-cancel');
        cancelBtn.disabled = !(appt.status === 'AGENDADO' || appt.status === 'SOLICITADO');
        cancelBtn.onclick = async () => {
            const id = Number(appt.id);
            if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
            try {
                cancelBtn.disabled = true;
                cancelBtn.innerText = 'Cancelando...';
                await services.deleteAppointment(id);
                showNotification('Agendamento cancelado com sucesso!');
                renderAppointments();
            } catch (error) {
                showNotification('Erro ao cancelar: ' + error.message, 'error');
                cancelBtn.disabled = false;
                cancelBtn.innerText = 'Cancelar reserva';
            }
        };

        card.appendChild(details);
        card.appendChild(price);
        card.appendChild(cancelBtn);

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
            const label = new Date(inicioIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const item = document.createElement('div');
            item.className = `time-slot-compact ${state.selectedTime === inicioIso ? 'selected' : ''}`;
            item.dataset.time = inicioIso;
            item.textContent = label;
            item.onclick = () => {
                state.selectedTime = item.dataset.time;
                renderProfileTimeSlots(slots);
                checkBookingReady();
            };
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
        const summary = document.createElement('div');
        summary.className = 'summary-item';

        const title = document.createElement('div');
        title.className = 'summary-title';
        title.textContent = 'Resumo do Pedido';

        summary.appendChild(title);
        summary.appendChild(createInfoRow('Profissional:', state.selectedProfessional.nome_profissional || state.selectedProfessional.nome));
        summary.appendChild(createInfoRow('Serviço:', state.selectedService.nome));
        summary.appendChild(
            createInfoRow(
                'Agendado para:',
                `${new Date(state.selectedTime).toLocaleDateString('pt-BR')} às ${new Date(state.selectedTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
            )
        );

        const totalRow = createInfoRow('Total:', formatCurrency(state.selectedService.preco_centavos));
        totalRow.classList.add('summary-total');
        summary.appendChild(totalRow);

        const note = document.createElement('div');
        note.className = 'summary-note';
        note.textContent = 'Pagamento e confirmação serão feitos no local.';

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

            const token = localStorage.getItem('token');
            if (token) {
                e.preventDefault();
                console.log('Logout clicked. Clearing session...');
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                console.log('Session cleared. Redirecting to login...');
                document.cookie = 'client_token=; Max-Age=0; path=/; SameSite=Lax';
                window.location.href = `${BASE_PATH}/login`;
            }
        });
    }
});
