// api.js - Global API Handler
const BASE_URL = 'http://localhost:5000/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('accessToken');
        const headers = {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        };

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);
            
            // Check if response is a file (CSV)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/csv')) {
                return await response.blob();
            }

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    auth.logout();
                }
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    async post(endpoint, body, isFormData = false) {
        return this.request(endpoint, {
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body),
        });
    },

    async patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// UI Utilities
const ui = {
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-[100] transition-all transform translate-y-20 opacity-0 ${
            type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-y-20', 'opacity-0');
        }, 100);

        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    showLoading(btn) {
        if (!btn) return;
        btn.dataset.originalText = btn.textContent;
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span> Loading...`;
    },

    hideLoading(btn) {
        if (!btn) return;
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText;
    }
};