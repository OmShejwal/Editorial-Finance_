// common-auth.js - Shared utility for Authentication and API calls

const BASE_URL = 'http://localhost:5000/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('accessToken');
        const headers = {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        };

        // Only set Content-Type if not FormData
        if (!(options.body instanceof FormData)) {
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
                if (response.status === 401) {
                    // Unauthorized - handle token expiry
                    this.logout();
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
        const options = {
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body),
        };
        if (isFormData) {
            // Fetch handles Content-Type for FormData automatically
            delete options.headers;
        }
        return this.request(endpoint, options);
    },

    async patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },

    login(token, user) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.redirectToDashboard(user.role);
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        let path = 'login.html';
        if (window.location.pathname.includes('/stitch/')) {
            const base = window.location.pathname.substring(0, window.location.pathname.indexOf('/stitch/') + 8);
            window.location.href = base + path;
        } else {
            window.location.href = '/' + path;
        }
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    updateUI() {
        const user = this.getUser();
        if (!user) return;

        // Update name and role in sidebars/headers
        const nameElements = document.querySelectorAll('.user-name-display');
        const roleElements = document.querySelectorAll('.user-role-display');
        
        nameElements.forEach(el => el.textContent = user.name);
        roleElements.forEach(el => {
            el.textContent = user.role;
            el.style.display = ''; // Ensure visible
        });

        // Hide/Show navigation items based on role
        const adminOnly = document.querySelectorAll('.admin-only');
        const managerOnly = document.querySelectorAll('.manager-only');

        if (user.role === 'Employee') {
            adminOnly.forEach(el => el.classList.add('hidden'));
            managerOnly.forEach(el => el.classList.add('hidden'));
        } else if (user.role === 'Manager') {
            adminOnly.forEach(el => el.classList.add('hidden'));
            managerOnly.forEach(el => el.classList.remove('hidden'));
        } else if (user.role === 'Admin') {
            adminOnly.forEach(el => el.classList.remove('hidden'));
            managerOnly.forEach(el => el.classList.remove('hidden'));
        }
    },

    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    },

    redirectToDashboard(role) {
        const rolePathMap = {
            'Admin': 'admin_dashboard_overview/code.html',
            'Manager': 'approval_queue_manager/code.html',
            'Employee': 'submit_expense_employee/code.html'
        };
        // Use relative paths to ensure it works with http-server root
        let path = rolePathMap[role] || 'login.html';
        
        // Use an absolute-style relative path if we're in the stitch folder context
        if (window.location.pathname.includes('/stitch/')) {
            const base = window.location.pathname.substring(0, window.location.pathname.indexOf('/stitch/') + 8);
            window.location.href = base + path;
        } else {
            // Root context
            window.location.href = '/' + path;
        }
    }
};

// Check auth on load for protected pages
if (!window.location.pathname.includes('login') && !window.location.pathname.includes('signup')) {
    if (!api.isAuthenticated()) {
        api.logout();
    } else {
        api.updateUI();
    }
}
