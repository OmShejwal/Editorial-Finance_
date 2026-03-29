// dashboard.js - Logic for dashboard pages
const dashboard = {
    async init() {
        const user = auth.getUser();
        if (!user) return;

        try {
            const stats = await api.getDashboardStats(user.role);
            this.renderStats(user.role, stats);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    },

    renderStats(role, stats) {
        if (role === 'Admin') {
            document.getElementById('totalExpenses').textContent = `$${stats.totalExpenses.toFixed(2)}`;
            document.getElementById('pendingApprovals').textContent = stats.pendingApprovals;
            document.getElementById('totalUsers').textContent = stats.totalUsers;
        } else if (role === 'Manager') {
            document.getElementById('teamExpenses').textContent = `$${stats.teamExpenses.toFixed(2)}`;
            document.getElementById('pendingApprovals').textContent = stats.pendingApprovals;
        } else if (role === 'Employee') {
            document.getElementById('myTotalApproved').textContent = `$${stats.myTotalApproved.toFixed(2)}`;
            document.getElementById('pendingCount').textContent = stats.pendingCount;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => dashboard.init());
