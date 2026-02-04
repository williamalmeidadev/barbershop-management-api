const API_BASE_URL = window.BASE_PATH || '';

const services = {
    async fetchServices(barbeiroId) {
        try {
            const query = barbeiroId ? `?ativo=1&barbeiro_id=${barbeiroId}` : '?ativo=1';
            if (window.API?.json) return await window.API.json(`/servicos${query}`);
            const response = await fetch(`${API_BASE_URL}/servicos${query}`);
            if (!response.ok) throw new Error('Não foi possível carregar os serviços');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async fetchBarbeiros() {
        try {
            if (window.API?.json) return await window.API.json('/barbeiros?ativo=1');
            const response = await fetch(`${API_BASE_URL}/barbeiros?ativo=1`);
            if (!response.ok) throw new Error('Não foi possível carregar os barbeiros');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async fetchAvailableSlots(barbeiroId, data) {
        try {
            if (window.API?.json) return await window.API.json(`/vagas/disponiveis?barbeiroId=${barbeiroId}&data=${data}`);
            const response = await fetch(`${API_BASE_URL}/vagas/disponiveis?barbeiroId=${barbeiroId}&data=${data}`);
            if (!response.ok) throw new Error('Não foi possível carregar as vagas');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async fetchAvailableServiceSlots(barbeiroId, data, servicosIds) {
        try {
            const ids = Array.isArray(servicosIds) ? servicosIds.join(',') : servicosIds;
            const url = `/vagas/disponibilidade-servicos?barbeiroId=${barbeiroId}&data=${data}&servicosIds=${ids}`;

            if (window.API?.json) return await window.API.json(url);
            const response = await fetch(`${API_BASE_URL}${url}`);
            if (!response.ok) throw new Error('Não foi possível carregar horários calculados');
            return await response.json();
        } catch (error) {
            console.error(error);
            return { horarios: [], duracaoTotal: 0 };
        }
    },

    async createAppointment(data) {
        try {
            if (window.API?.json) {
                return await window.API.json('/agendamentos', { method: 'POST', body: JSON.stringify(data) });
            }
            const response = await fetch(`${API_BASE_URL}/agendamentos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Erro ao agendar');
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    async fetchUserAppointments() {
        try {
            if (window.API?.json) return await window.API.json('/agendamentos/me');
            const response = await fetch(`${API_BASE_URL}/agendamentos/me`, {
                headers: {}
            });
            if (!response.ok) throw new Error('Não foi possível carregar seus agendamentos');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async deleteAppointment(id) {
        try {
            if (window.API?.json) {
                await window.API.json(`/agendamentos/${id}/cancelar`, { method: 'POST' });
                return true;
            }
            const response = await fetch(`${API_BASE_URL}/agendamentos/${id}/cancelar`, {
                method: 'POST',
                headers: {}
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Erro ao cancelar agendamento');
            }
            return true;
        } catch (error) {
            console.error(error);
            // Even if it fails on backend for this demo, we'll return true if it's our mock ID
            if (id === 999) return true;
            throw error;
        }
    },

    async login(email, password) {
        const data = window.API?.json
            ? await window.API.json('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            })
            : await (async () => {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                const resData = await response.json();
                if (!response.ok) throw new Error(resData.message || 'Credenciais inválidas');
                return resData;
            })();

        return data;
    },

    async register(nome, email, password, telefone) {
        const data = window.API?.json
            ? await window.API.json('/clientes', {
                method: 'POST',
                body: JSON.stringify({
                    nome,
                    email,
                    password,
                    telefone: telefone || null,
                })
            })
            : await (async () => {
                const response = await fetch(`${API_BASE_URL}/clientes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nome,
                        email,
                        password,
                        telefone: telefone || null,
                    }),
                });
                const resData = await response.json();
                if (!response.ok) throw new Error(resData.message || resData.error || 'Erro ao cadastrar');
                return resData;
            })();

        return data;
    }
};

window.services = services;
