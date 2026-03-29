// api.js - Base API configuration and helper functions
const BASE_URL = 'http://localhost:5000/api';

const api = {
    // Generic request helper
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        };

        // Automatically set Content-Type to application/json if body is not FormData
        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle 401 Unauthorized globally
                if (response.status === 401 && !window.location.pathname.includes('login.html')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                }
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // 1. Auth Helpers
    async loginUser(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async signupUser(userData) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async getCurrentUser() {
        return this.request('/auth/me');
    },

    // 2. Expense Helpers
    async createExpense(formData) {
        return this.request('/expenses', {
            method: 'POST',
            body: formData, // FormData handles its own headers
        });
    },

    async getExpenses() {
        return this.request('/expenses/my');
    },

    async scanReceipt(formData) {
        return this.request('/expenses/scan-receipt', {
            method: 'POST',
            body: formData,
        });
    },

    // 3. Approval Helpers
    async getPendingApprovals() {
        return this.request('/approvals/pending');
    },

    async approveExpense(id, comment = '') {
        return this.request(`/approvals/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify({ comment })
        });
    },

    async rejectExpense(id, comment = '') {
        return this.request(`/approvals/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ comment })
        });
    },

    // 4. Dashboard Helpers
    async getDashboardStats(role) {
        return this.request(`/dashboard/${role.toLowerCase()}`);
    }
};
