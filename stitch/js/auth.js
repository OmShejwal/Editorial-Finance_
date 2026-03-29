// auth.js - Authentication logic
const auth = {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.redirectToDashboard(response.user.role);
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    },

    async signup(body) {
        try {
            const response = await api.post('/auth/signup', body);
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.redirectToDashboard(response.user.role);
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        const base = window.location.pathname.includes('/stitch/') ? 
            window.location.pathname.substring(0, window.location.pathname.indexOf('/stitch/') + 8) : '/';
        window.location.href = base + 'login.html';
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    },

    redirectToDashboard(role) {
        const rolePathMap = {
            'Admin': 'admin_dashboard_overview/code.html',
            'Manager': 'admin_dashboard_overview/code.html',
            'Employee': 'submit_expense_employee/code.html'
        };
        const path = rolePathMap[role] || 'login.html';
        const base = window.location.pathname.includes('/stitch/') ? 
            window.location.pathname.substring(0, window.location.pathname.indexOf('/stitch/') + 8) : '/';
        window.location.href = base + path;
    },

    updateUI() {
        const user = this.getUser();
        if (!user) return;

        document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.name);
        document.querySelectorAll('.user-role-display').forEach(el => el.textContent = user.role);

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
    }
};

// Check auth on load for protected pages
if (!window.location.pathname.includes('login') && !window.location.pathname.includes('signup')) {
    if (!auth.isAuthenticated()) {
        auth.logout();
    } else {
        auth.updateUI();
    }
}