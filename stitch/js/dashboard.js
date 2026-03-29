// dashboard.js - Admin/Manager Dashboard functionality
const dashboard = {
    async loadStats(startDate, endDate) {
        try {
            const user = auth.getUser();
            if (!user) return;
            const role = user.role;
            const url = role === 'Admin' ? '/dashboard/admin' : role === 'Manager' ? '/dashboard/manager' : '/dashboard/employee';
            
            let queryParams = [];
            if (startDate) queryParams.push(`startDate=${startDate}`);
            if (endDate) queryParams.push(`endDate=${endDate}`);
            const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

            const data = await api.get(url + query);
            this.updateStatsCards(data, role);
            
            if (window.location.pathname.includes('admin_dashboard_overview')) {
                this.loadMonthlySpendChart(startDate, endDate);
                this.loadRecentExpenses(startDate, endDate);
            }
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    },

    async loadMonthlySpendChart(startDate, endDate) {
        let endpoint = '/dashboard/monthly-spend';
        if (startDate || endDate) {
            endpoint += `?startDate=${startDate || ''}&endDate=${endDate || ''}`;
        }

        try {
            const data = await api.get(endpoint);
            this.renderChart(data);
        } catch (error) {
            console.error('Failed to load chart data:', error);
        }
    },

    renderChart(data) {
        const ctx = document.getElementById('spendVelocityChart');
        if (!ctx || !data || !data.labels || !data.data) return;

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Approved Spend',
                    data: data.data,
                    borderColor: '#27609d',
                    backgroundColor: 'rgba(39, 96, 157, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#27609d'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Spend: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            callback: value => `$${value.toLocaleString()}`
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    },

    getStatusClass(status) {
        switch (status) {
            case 'Approved': return 'bg-primary-container text-on-primary-container';
            case 'Rejected': return 'bg-error-container text-on-error-container';
            default: return 'bg-secondary-container text-on-secondary-container';
        }
    },

    updateStatsCards(data, role) {
        const currencySymbols = { 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£' };
        const symbol = currencySymbols[data.companyCurrency] || '$';

        const headerTitle = document.querySelector('h1.text-3xl.font-extrabold');
        const headerSub = document.querySelector('header p.text-on-surface-variant');

        // Reset to default headers if they exist
        if (headerTitle) headerTitle.textContent = 'Executive Summary';
        if (headerSub) headerSub.textContent = 'Fiscal Period: Q3 2023 | Oversight View';

        if (role === 'Admin') {
            const totalEl = document.getElementById('totalExpenses');
            const pendingEl = document.getElementById('pendingApprovals');
            const usersEl = document.getElementById('totalUsers');
            
            if (totalEl) totalEl.textContent = `${symbol}${data.totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
            if (pendingEl) pendingEl.textContent = data.pendingApprovals;
            if (usersEl) usersEl.textContent = data.totalUsers;
        } else if (role === 'Manager') {
            const totalEl = document.getElementById('totalExpenses');
            const pendingEl = document.getElementById('pendingApprovals');
            const usersEl = document.getElementById('totalUsers');
            
            if (totalEl) {
                const labelEl = totalEl.previousElementSibling;
                if (labelEl) labelEl.textContent = 'TEAM EXPENSES';
                totalEl.textContent = `${symbol}${(data.teamExpenses || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
            }
            if (pendingEl) pendingEl.textContent = data.pendingApprovals;
            if (usersEl) {
                const labelEl = usersEl.previousElementSibling;
                if (labelEl) labelEl.textContent = 'TEAM MEMBERS';
                usersEl.textContent = data.teamMembersCount || 0;
            }
        } else if (role === 'Employee') {
            const totalEl = document.getElementById('myTotalApproved');
            const pendingEl = document.getElementById('pendingCount');
            if (totalEl) totalEl.textContent = `${symbol}${(data.myTotalApproved || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
            if (pendingEl) pendingEl.textContent = data.pendingCount;
        }
    },

    async loadRecentExpenses(startDate, endDate) {
        try {
            let url = '/expenses/recent';
            let queryParams = [];
            if (startDate) queryParams.push(`startDate=${startDate}`);
            if (endDate) queryParams.push(`endDate=${endDate}`);
            if (queryParams.length > 0) url += `?${queryParams.join('&')}`;

            const expenses = await api.get(url);
            const tbody = document.querySelector('tbody');
            if (!tbody) return;
            tbody.innerHTML = '';

            expenses.forEach(expense => {
                const tr = document.createElement('tr');
                tr.className = 'group hover:bg-surface-container-high transition-colors cursor-pointer';
                tr.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <input type="checkbox" data-id="${expense._id}" class="rounded border-slate-300 text-primary focus:ring-primary">
                            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                ${expense.userId.name.charAt(0)}
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-on-surface">${expense.userId.name}</p>
                                <p class="text-[10px] text-on-surface-variant">${expense.userId.role}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-on-surface-variant">
                        ${new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-secondary-container text-on-secondary-container uppercase">
                            ${expense.category}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <p class="text-sm font-bold text-on-surface">$${expense.convertedAmount.toLocaleString()}</p>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="px-3 py-1 text-[10px] font-bold rounded-full ${this.getStatusClass(expense.status)}">
                            ${expense.status}
                        </span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Failed to load recent expenses:', error);
        }
    },

    async exportData() {
        try {
            const blob = await api.get('/dashboard/export');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ERMS_Report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            ui.showToast('Report exported successfully');
        } catch (error) {
            ui.showToast('Failed to export report', 'error');
        }
    }
};

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin_dashboard_overview')) {
        dashboard.loadStats();
        dashboard.loadRecentExpenses();
    }
});