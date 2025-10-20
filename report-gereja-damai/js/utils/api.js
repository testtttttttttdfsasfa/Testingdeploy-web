const API_BASE_URL = 'http://localhost:3001/api';

export async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Finance API
export const financeAPI = {
    async getTransactions(limit = 50) {
        return fetchAPI(`/finance/transactions?limit=${limit}`);
    },

    async getMonthlyData(year) {
        return fetchAPI(`/finance/monthly?year=${year}`);
    },

    async getSummary(year, month) {
        return fetchAPI(`/finance/summary?year=${year}&month=${month}`);
    },

    async getCategories() {
        return fetchAPI(`/finance/categories`);
    },

    async createTransaction(data) {
        return fetchAPI('/finance/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// Events API
export const eventsAPI = {
    async getEvents() {
        return fetchAPI('/events');
    },

    async createEvent(data) {
        return fetchAPI('/events', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async deleteEvent(id) {
        return fetchAPI(`/events/${id}`, {
            method: 'DELETE',
        });
    },
};
