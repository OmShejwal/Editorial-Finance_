// auth.js - Guarding routes and managing sessions
const auth = {
    // Check if user is logged in
    checkToken() {
        const token = localStorage.getItem('token');
        if (!token && !this.isAuthPage()) {
            window.location.href = 'login.html';
        }
        return token;
    },

    // Check if current page is login or signup
    isAuthPage() {
        const path = window.location.pathname;
        return path.includes('login.html') || path.includes('signup.html');
    },

    // Decode token to get user info (basic version)
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Logout user
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    // Initialize page protection and navbar
    async init() {
        if (!this.isAuthPage()) {
            try {
                const user = await api.getCurrentUser();
                localStorage.setItem('user', JSON.stringify(user));
                this.checkRoleAccess(user.role);
                this.renderNavbar(user);
            } catch (error) {
                console.error('Auth verification failed:', error);
                this.logout();
            }
        }
    },

    // Restrict pages based on role
    checkRoleAccess(role) {
        const path = window.location.pathname;
        
        if (path.includes('dashboard-admin.html') && role !== 'Admin') {
            window.location.href = `dashboard-${role.toLowerCase()}.html`;
        }
        if (path.includes('dashboard-manager.html') && role === 'Employee') {
            window.location.href = 'dashboard-employee.html';
        }
        if (path.includes('approvals.html') && role === 'Employee') {
            alert('Access Denied: Employees cannot view approvals.');
            window.location.href = 'dashboard-employee.html';
        }
    },

    // Dynamic Navbar
    renderNavbar(user) {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        let navLinks = `
            <li><a href="dashboard-${user.role.toLowerCase()}.html">Dashboard</a></li>
            <li><a href="submit-expense.html">Submit Expense</a></li>
            <li><a href="history.html">History</a></li>
        `;

        if (user.role === 'Admin' || user.role === 'Manager') {
            navLinks += `<li><a href="approvals.html">Approvals</a></li>`;
        }

        navLinks += `<li><a href="#" id="logout-btn">Logout</a></li>`;
        navLinks += `<li class="user-info"><strong>${user.name} (${user.role})</strong></li>`;

        nav.innerHTML = `<ul>${navLinks}</ul>`;

        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }
};

// Guard immediately
auth.checkToken();

// Run init on DOM load
document.addEventListener('DOMContentLoaded', () => auth.init());
