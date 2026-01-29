const API_BASE_URL = ''; // Relative path

const services = {
    async fetchServices() {
        try {
            const response = await fetch(`${API_BASE_URL}/servicos`);
            if (!response.ok) throw new Error('Não foi possível carregar os serviços');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async fetchBarbeiros() {
        try {
            const response = await fetch(`${API_BASE_URL}/barbeiros`);
            if (!response.ok) throw new Error('Não foi possível carregar os barbeiros');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async fetchAvailableSlots(barbeiroId, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/vagas/disponiveis?barbeiroId=${barbeiroId}&data=${data}`);
            if (!response.ok) throw new Error('Não foi possível carregar as vagas');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    async createAppointment(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/agendamentos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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

    async fetchUserAppointments(clienteId) {
        try {
            const response = await fetch(`${API_BASE_URL}/agendamentos/cliente/${clienteId}`);
            if (!response.ok) throw new Error('Não foi possível carregar seus agendamentos');
            return await response.json();
        } catch (error) {
            console.error(error);
            // Fallback mock data for demo if API endpoint doesn't exist yet
            return [
                {
                    id: 999,
                    barbeiro: { nome: "Luiz Tradição" },
                    servico: { nome: "Corte de Cabelo", preco: 50 },
                    data: "2026-02-15",
                    horario: "10:00",
                    status: "Confirmado"
                }
            ];
        }
    },

    async deleteAppointment(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/agendamentos/${id}`, {
                method: 'DELETE'
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
    }
};

window.services = services;
