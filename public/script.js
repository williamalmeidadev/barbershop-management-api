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

	const sampleBarbers = [];

	// --- DOM Elements ---
	const professionalsGrid = document.getElementById('professionals-grid');
	const barberProfileView = document.getElementById('barber-profile');
	const bookingWizardView = document.getElementById('booking-wizard-view');
	const menuToggle = document.getElementById('menu-toggle');
	const navMenu = document.getElementById('nav-menu');
	const navAppointments = document.getElementById('nav-appointments');
	const appointmentsView = document.getElementById('appointments');
	const appointmentsList = document.getElementById('appointments-list');
	const homeSections = ['hero', 'professionals', 'appointments'];

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
		setupEventListeners();

		const today = new Date().toISOString().split('T')[0];
		if (profileBookingDate) profileBookingDate.min = today;

		updateAuthUI();
	}

	function updateAuthUI() {
		if (state.isLoggedIn) {
			if (navAppointments) navAppointments.classList.remove('hidden');
			const loginBtn = document.querySelector('.nav-button[href="login.html"]');
			if (loginBtn) {
				loginBtn.innerText = 'Sair';
				loginBtn.href = "#";
				loginBtn.id = 'logout-btn';
			}
		}
	}

	async function loadInitialData() {
		try {
			state.services = await services.fetchServices();
			state.professionals = await services.fetchBarbeiros();
		} catch (error) {
			console.error('Falha ao carregar dados iniciais', error);
			showNotification('Falha ao carregar dados dos barbeiros', 'error');
		}
	}

	// --- Renderers ---
function renderProfessionals() {
		if (!professionalsGrid) return;
		if (!state.professionals.length) {
			professionalsGrid.innerHTML = '<div class="loading">Nenhum barbeiro disponível no momento.</div>';
			return;
		}

		professionalsGrid.innerHTML = state.professionals.map(pro => {
            const avatarContent = pro.foto_url 
                ? `<img src="${pro.foto_url}" alt="${pro.nome_profissional}" class="barber-avatar-img">`
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

        const profileAvatarDiv = document.querySelector('#barber-profile .profile-avatar');
        
        if (profileAvatarDiv) {
            if (pro.foto_url) {
                profileAvatarDiv.innerHTML = `<img src="${pro.foto_url}" alt="${pro.nome_profissional}" class="barber-avatar-img">`;
            } else {
                profileAvatarDiv.innerHTML = `<span class="material-icons">person</span>`;
            }
        }

		renderProfileServices();
		renderProfileTimeSlots([]); // clean time slots

		// Show profile view
		homeSections.forEach(sid => document.getElementById(sid).classList.add('hidden'));
		barberProfileView.classList.remove('hidden');
		window.scrollTo(0, 0);
	}

	function renderProfileServices() {
		// Mock filtering: In a real marketplace, services would belong to a barber
		// Here we just show all services as available for any barber for demo purposes
		profileServicesList.innerHTML = state.services.map(service => `
            <div class="profile-service-card ${state.selectedService?.id === service.id ? 'selected' : ''}" data-id="${service.id}">
                <div>
                    <h4 style="margin-bottom: 0.2rem;">${service.nome}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">${service.descricao || 'Serviço de alta qualidade'}</p>
                </div>
                <div style="text-align: right;">
                    <span style="color: var(--primary); font-weight: 700;">R$ ${(service.preco_centavos / 100).toFixed(2)}</span>
                    <p style="font-size: 0.7rem;">${service.duracao_minutos || 30} min</p>
                </div>
            </div>
        `).join('');

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
			const appointments = await services.fetchUserAppointments(1); // Client ID 1 as default
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
							renderAppointments(); // Refresh list
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

		profileTimeSlots.innerHTML = slots.map(slot => `
            <div class="time-slot-compact ${state.selectedTime === slot ? 'selected' : ''}" data-time="${slot}">
                ${slot}
            </div>
        `).join('');

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
                    <strong>Agendado para:</strong> <span>${new Date(state.selectedDate).toLocaleDateString()} às ${state.selectedTime}</span>
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
			homeSections.forEach(sid => document.getElementById(sid).classList.remove('hidden'));
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
					servicoId: state.selectedService.id,
					barbeiroId: state.selectedProfessional.id,
					data: state.selectedDate,
					horario: state.selectedTime,
					clienteId: 1 // Default
				};

				try {
					await services.createAppointment(payload);
					showNotification('Agendamento confirmado com sucesso!');

					setTimeout(() => {
						bookingWizardView.classList.add('hidden');
						homeSections.forEach(sid => document.getElementById(sid).classList.remove('hidden'));
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

		// Nav Appointments Link
		if (navAppointments) {
			navAppointments.onclick = (e) => {
				e.preventDefault();
				homeSections.forEach(sid => document.getElementById(sid).classList.add('hidden'));
				barberProfileView.classList.add('hidden');
				bookingWizardView.classList.add('hidden');

				appointmentsView.classList.remove('hidden');
				renderAppointments();

				// Update active link
				navMenu.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
				navAppointments.classList.add('active');
			};
		}

		// Home Link (override default to show main sections)
		const homeLink = document.querySelector('.nav-link[href="#home"]');
		if (homeLink) {
			homeLink.onclick = (e) => {
				e.preventDefault();
				appointmentsView.classList.add('hidden');
				barberProfileView.classList.add('hidden');
				bookingWizardView.classList.add('hidden');
				homeSections.forEach(sid => {
					const el = document.getElementById(sid);
					if (el && sid !== 'appointments') el.classList.remove('hidden');
				});

				navMenu.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
				homeLink.classList.add('active');
			};
		}

		// Logout functionality
		const logoutBtn = document.getElementById('logout-btn');
		if (logoutBtn) {
			logoutBtn.onclick = (e) => {
				e.preventDefault();
				localStorage.clear();
				window.location.href = 'login.html';
			};
		}
	}
});
