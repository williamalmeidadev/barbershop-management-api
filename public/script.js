const BASE_PATH = '/server08';

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
    const customerNameInput = document.getElementById('customer-name');
    const customerPhoneInput = document.getElementById('customer-phone');
    const btnToSummary = document.getElementById('btn-to-summary');
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
            state.services = await services.fetchServices();
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

        if (!state.services || state.services.length === 0) {
            servicesGrid.innerHTML = '<div class="loading">Carregando serviços...</div>';
            return;
        }

        servicesGrid.replaceChildren();
        state.services.forEach(service => {
            const card = document.createElement('div');
            card.className = 'card service-card';

            const mediaWrap = document.createElement('div');
            mediaWrap.className = 'service-media-app';

            const mediaSrc = normalizeImageUrl(service.foto_url);
            if (mediaSrc) {
                const img = document.createElement('img');
                img.src = mediaSrc;
                img.alt = service.nome;
                img.onerror = () => {
                    const fallback = document.createElement('span');
                    fallback.className = 'material-icons';
                    fallback.textContent = 'content_cut';
                    mediaWrap.replaceChildren(fallback);
                };
                mediaWrap.appendChild(img);
            } else {
                const fallback = document.createElement('span');
                fallback.className = 'material-icons';
                fallback.textContent = 'content_cut';
                mediaWrap.appendChild(fallback);
            }

            const title = document.createElement('h3');
            title.style.textAlign = 'center';
            title.textContent = service.nome;

            const desc = document.createElement('p');
            desc.style.textAlign = 'center';
            desc.style.color = 'var(--text-muted)';
            desc.style.fontSize = '0.9rem';
            desc.style.marginBottom = '1.5rem';
            desc.style.minHeight = '3em';
            desc.textContent = service.descricao || 'Procedimento realizado com os melhores produtos do mercado.';

            const footer = document.createElement('div');
            footer.style.display = 'flex';
            footer.style.justifyContent = 'space-between';
            footer.style.alignItems = 'center';
            footer.style.borderTop = '1px solid var(--border)';
            footer.style.paddingTop = '1rem';
            footer.style.marginTop = 'auto';

            const duration = document.createElement('div');
            duration.style.display = 'flex';
            duration.style.alignItems = 'center';
            duration.style.gap = '5px';
            duration.style.color = 'var(--text-muted)';
            duration.style.fontSize = '0.9rem';
            const durationIcon = document.createElement('span');
            durationIcon.className = 'material-icons';
            durationIcon.style.fontSize = '1rem';
            durationIcon.textContent = 'schedule';
            duration.appendChild(durationIcon);
            duration.appendChild(document.createTextNode(` ${service.duracao_minutos} min`));

            const price = document.createElement('div');
            price.style.color = 'var(--primary)';
            price.style.fontWeight = '700';
            price.style.fontSize = '1.2rem';
            price.textContent = `R$ ${(service.preco_centavos / 100).toFixed(2)}`;

            footer.appendChild(duration);
            footer.appendChild(price);

            card.appendChild(mediaWrap);
            card.appendChild(title);
            card.appendChild(desc);
            card.appendChild(footer);

            servicesGrid.appendChild(card);
        });
    }

    function renderProfessionals() {
        if (!professionalsGrid) return;
        if (!state.professionals.length) {
            professionalsGrid.innerHTML = '<div class="loading">Nenhum barbeiro disponível no momento.</div>';
            return;
        }

        professionalsGrid.innerHTML = state.professionals.map(pro => {
            const fallbackIcon = `<span class='material-icons' style='font-size: 2.5rem; color: var(--primary);'>person</span>`;

            const avatarSrc = normalizeImageUrl(pro.foto_url);
            const avatarContent = avatarSrc
                ? `<img src="${avatarSrc}" 
                       alt="${pro.nome_profissional}" 
                       class="barber-avatar-img" 
                       onerror="this.parentElement.innerHTML = &quot;${fallbackIcon}&quot;">`
                : `<span class="material-icons" style="font-size: 2.5rem; color: var(--primary);">person</span>`;

            return `
            <div class="card" data-id="${pro.id}">
                <div class="avatar-container">
                    ${avatarContent}
                </div>
                <h3 style="text-align: center;">${pro.nome_profissional || pro.nome}</h3>
                <p style="text-align: center; color: var(--text-muted);">${pro.bio || pro.especialidade || 'Barbeiro Profissional'}</p>
                <div style="margin-top: 1.5rem; text-align: center;">
                    <span style="color: var(--primary); font-weight: 700; font-size: 0.9rem;">Ver Serviços e Horários</span>
                </div>
            </div>
        `}).join('');

        professionalsGrid.querySelectorAll('.card').forEach(card => {
            card.onclick = () => {
                const id = parseInt(card.dataset.id);
                showBarberProfile(id);
            };
        });
    }

    function showBarberProfile(id) {
        const pro = state.professionals.find(p => p.id === id);
        if (!pro) return;

        state.selectedProfessional = pro;
        state.selectedService = null;
        state.selectedTime = null;
        state.selectedDate = null;
        if (profileBookingDate) profileBookingDate.value = '';

        profileName.innerText = pro.nome_profissional || pro.nome;
        profileSpecialty.innerText = pro.bio || pro.especialidade || 'Barbeiro Profissional';

        const profileHeader = document.querySelector('.profile-header');

        const oldAvatar = document.querySelector('.profile-avatar, .profile-avatar-wrapper');
        if (oldAvatar) oldAvatar.remove();

        const fallbackIconBig = `<span class='material-icons' style='font-size: 4rem; color: var(--text-muted);'>person</span>`;

        const avatarSrc = normalizeImageUrl(pro.foto_url);
        const avatarUrl = avatarSrc
            ? `<img src="${avatarSrc}" 
                   alt="${pro.nome_profissional}" 
                   class="barber-avatar-img"
                   onerror="this.parentElement.innerHTML = &quot;${fallbackIconBig}&quot;">`
            : `<span class="material-icons" style="font-size: 4rem; color: var(--text-muted);">person</span>`;

        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'profile-avatar-wrapper';
        wrapperDiv.innerHTML = `
            <div class="profile-avatar" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: var(--surface);">
                ${avatarUrl}
            </div>
        `;

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
        state.services.forEach(service => {
            const card = document.createElement('div');
            card.className = `profile-service-card ${state.selectedService?.id === service.id ? 'selected' : ''}`;
            card.dataset.id = String(service.id);

            const mediaWrap = document.createElement('div');
            mediaWrap.className = 'profile-service-media';

            const mediaSrc = normalizeImageUrl(service.foto_url);
            if (mediaSrc) {
                const img = document.createElement('img');
                img.src = mediaSrc;
                img.alt = service.nome;
                img.onerror = () => {
                    const fallback = document.createElement('span');
                    fallback.className = 'material-icons';
                    fallback.textContent = 'content_cut';
                    mediaWrap.replaceChildren(fallback);
                };
                mediaWrap.appendChild(img);
            } else {
                const fallback = document.createElement('span');
                fallback.className = 'material-icons';
                fallback.textContent = 'content_cut';
                mediaWrap.appendChild(fallback);
            }

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
            priceValue.textContent = `R$ ${(service.preco_centavos / 100).toFixed(2)}`;
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
        appointmentsList.innerHTML = '<div class="loading">Buscando seus agendamentos...</div>';

        try {
            const appointments = await services.fetchUserAppointments();
            if (appointments.length === 0) {
                appointmentsList.innerHTML = '<p style="grid-column: 1/-1;">Você ainda não possui agendamentos.</p>';
                return;
            }

            appointmentsList.innerHTML = appointments.map(appt => `
                <div class="appointment-card" data-id="${appt.id}">
                    <div class="appointment-header">
                        <h3 style="margin: 0;">${appt.barbeiro.nome}</h3>
                        <span class="appointment-status">${appt.status}</span>
                    </div>
                    <div class="appointment-details">
                        <p><span class="material-icons">content_cut</span> ${appt.servico.nome}</p>
                        <p><span class="material-icons">calendar_today</span> ${new Date(appt.data).toLocaleDateString()} às ${appt.horario}</p>
                    </div>
                    <div class="appointment-price">
                        R$ ${(appt.servico.preco_centavos / 100).toFixed(2)}
                    </div>
                    <button class="btn-cancel" data-id="${appt.id}">Cancelar reserva</button>
                </div>
            `).join('');

            appointmentsList.querySelectorAll('.btn-cancel').forEach(btn => {
                btn.onclick = async () => {
                    const id = parseInt(btn.dataset.id);
                    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                        try {
                            btn.disabled = true;
                            btn.innerText = 'Cancelando...';
                            await services.deleteAppointment(id);
                            showNotification('Agendamento cancelado com sucesso!');
                            renderAppointments();
                        } catch (error) {
                            showNotification('Erro ao cancelar: ' + error.message, 'error');
                            btn.disabled = false;
                            btn.innerText = 'Cancelar reserva';
                        }
                    }
                };
            });
        } catch (error) {
            appointmentsList.innerHTML = '<p style="grid-column: 1/-1; color: var(--primary);">Erro ao carregar agendamentos.</p>';
        }
    }

    async function loadProfileTimeSlots() {
        if (!state.selectedProfessional || !state.selectedDate) return;

        profileTimeSlots.innerHTML = '<div class="placeholder-text">Buscando horários...</div>';
        try {
            const slots = await services.fetchAvailableSlots(state.selectedProfessional.id, state.selectedDate);
            renderProfileTimeSlots(slots);
        } catch (error) {
            profileTimeSlots.innerHTML = '<div class="placeholder-text">Erro ao carregar horários.</div>';
        }
    }

    function renderProfileTimeSlots(slots) {
        if (slots.length === 0) {
            profileTimeSlots.innerHTML = state.selectedDate ?
                '<p class="placeholder-text">Sem horários para esta data.</p>' :
                '<p class="placeholder-text">Selecione uma data para ver os horários</p>';
            return;
        }

        profileTimeSlots.innerHTML = slots.map(slot => {
            const inicioIso = slot.inicio;
            const label = new Date(inicioIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return `
            <div class="time-slot-compact ${state.selectedTime === inicioIso ? 'selected' : ''}" data-time="${inicioIso}">
                ${label}
            </div>
        `;
        }).join('');

        profileTimeSlots.querySelectorAll('.time-slot-compact').forEach(slot => {
            slot.onclick = () => {
                state.selectedTime = slot.dataset.time;
                renderProfileTimeSlots(slots);
                checkBookingReady();
            };
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
        bookingSummary.innerHTML = `
            <div class="summary-item" style="margin-bottom: 1.5rem; padding: 1.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="font-family: 'Playfair Display', serif; font-size: 1.2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                    Resumo do Pedido
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                    <strong>Profissional:</strong> <span>${state.selectedProfessional.nome_profissional || state.selectedProfessional.nome}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                    <strong>Serviço:</strong> <span>${state.selectedService.nome}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                    <strong>Agendado para:</strong> <span>${new Date(state.selectedTime).toLocaleDateString('pt-BR')} às ${new Date(state.selectedTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 1.5rem; border-top: 2px solid var(--primary); padding-top: 1rem; color: var(--primary); font-size: 1.3rem; font-weight: 700;">
                    <strong>Total:</strong> <span>R$ ${(state.selectedService.preco_centavos / 100).toFixed(2)}</span>
                </div>
            </div>
            <div style="padding: 0 1rem; color: var(--text-muted); font-size: 0.9rem;">
                Cliente: ${state.customerName}<br>
                Contato: ${state.customerPhone}
            </div>
        `;
    }

    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
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
        };

        cancelBookingBtn.onclick = () => {
            bookingWizardView.classList.add('hidden');
            barberProfileView.classList.remove('hidden');
        };

        customerNameInput.addEventListener('input', (e) => {
            state.customerName = e.target.value;
            checkInfoFields();
        });

        customerPhoneInput.addEventListener('input', (e) => {
            state.customerPhone = e.target.value;
            checkInfoFields();
        });

        function checkInfoFields() {
            btnToSummary.disabled = !(state.customerName.length > 2 && state.customerPhone.length > 8);
        }

        btnToSummary.onclick = () => goToWizardStep(2);

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
                    showNotification('Agendamento confirmado com sucesso!');

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
