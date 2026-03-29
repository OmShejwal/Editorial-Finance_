// approvals.js - Approval queue and actions
const approvals = {
    async loadPendingApprovals() {
        try {
            const data = await api.get('/approvals/pending');
            const tbody = document.getElementById('approvalList');
            const countDisplay = document.getElementById('pendingCountDisplay');
            if (countDisplay) countDisplay.textContent = data.length;
            if (!tbody) return;
            tbody.innerHTML = '';

            const currencySymbols = { 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£' };

            data.forEach(expense => {
                const symbol = currencySymbols[expense.originalCurrency] || '$';
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-surface-container-low cursor-pointer transition-colors duration-200';
                tr.innerHTML = `
                    <td class="px-6 py-5">
                        <div class="flex items-center gap-3">
                            <input type="checkbox" class="rounded border-slate-300 mr-2" data-id="${expense._id}" onclick="event.stopPropagation()">
                            <div class="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden flex-shrink-0">
                                <span class="material-symbols-outlined text-on-primary-fixed m-2">person</span>
                            </div>
                            <div>
                                <div class="font-bold text-sm text-on-surface font-body">${expense.userId.name}</div>
                                <div class="text-xs text-on-surface-variant font-body">${expense.userId.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-5">
                        <span class="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface text-[0.6875rem] font-bold font-label">${expense.category}</span>
                    </td>
                    <td class="px-6 py-5 text-sm text-on-surface-variant font-body">${new Date(expense.date).toLocaleDateString()}</td>
                    <td class="px-6 py-5 text-right font-bold text-sm text-on-surface font-body">${symbol}${expense.amount.toFixed(2)}</td>
                    <td class="px-6 py-5 text-right">
                        <span class="material-symbols-outlined text-primary">chevron_right</span>
                    </td>
                `;
                tr.onclick = () => this.showDetail(expense);
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Failed to load pending approvals:', error);
        }
    },

    showDetail(expense) {
        this.currentExpense = expense;
        const panel = document.getElementById('detailPanel');
        const content = document.getElementById('detailContent');
        if (!panel || !content) return;
        
        const currencySymbols = { 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£' };
        const symbol = currencySymbols[expense.companyCurrency] || '$';
        const origSymbol = currencySymbols[expense.originalCurrency] || '$';

        panel.classList.remove('hidden');
        content.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="space-y-1">
                    <div class="text-[0.6875rem] font-bold text-on-surface-variant font-label uppercase tracking-widest">${expense.vendorName || 'General Expense'}</div>
                    <div class="text-2xl font-extrabold text-on-surface font-headline">${origSymbol}${expense.amount.toFixed(2)} <span class="text-sm font-medium text-on-surface-variant font-body">${expense.originalCurrency}</span></div>
                    <div class="text-xs font-medium text-primary bg-primary-container inline-block px-2 py-0.5 rounded">Converted: ${symbol}${expense.convertedAmount.toFixed(2)} ${expense.companyCurrency}</div>
                </div>
                <div class="text-right">
                    <span class="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-wider">${expense.status}</span>
                    <div class="text-[0.6875rem] text-on-surface-variant mt-2 font-body">ID: ${expense._id}</div>
                </div>
            </div>
            <div class="space-y-3">
                <label class="text-[0.6875rem] font-bold text-on-surface-variant font-label uppercase">Receipt Image</label>
                <div class="relative group cursor-pointer overflow-hidden rounded-lg aspect-video bg-surface-container-low border border-outline-variant/20">
                    <img src="http://localhost:5000/${expense.receiptUrl}" class="w-full h-full object-cover">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-6">
                <div class="space-y-1">
                    <div class="text-[0.6875rem] font-bold text-on-surface-variant font-label uppercase">Category</div>
                    <div class="text-sm font-medium text-on-surface font-body">${expense.category}</div>
                </div>
                <div class="space-y-1">
                    <div class="text-[0.6875rem] font-bold text-on-surface-variant font-label uppercase">Submission Date</div>
                    <div class="text-sm font-medium text-on-surface font-body">${new Date(expense.createdAt).toLocaleString()}</div>
                </div>
            </div>
            <div class="space-y-1">
                <div class="text-[0.6875rem] font-bold text-on-surface-variant font-label uppercase">Description</div>
                <div class="text-sm font-medium text-on-surface font-body">${expense.description || 'No description provided'}</div>
            </div>
        `;
    },

    async approve(id, comment) {
        try {
            await api.post(`/approvals/${id}/approve`, { comment });
            ui.showToast('Expense approved successfully');
            this.loadPendingApprovals();
            document.getElementById('detailPanel').classList.add('hidden');
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    },

    async reject(id, comment) {
        try {
            await api.post(`/approvals/${id}/reject`, { comment });
            ui.showToast('Expense rejected successfully');
            this.loadPendingApprovals();
            document.getElementById('detailPanel').classList.add('hidden');
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    },

    async batchApprove(expenseIds, comment) {
        try {
            await api.post('/approvals/batch-approve', { expenseIds, comment });
            ui.showToast('Batch approval completed');
            if (window.location.pathname.includes('approval_queue_manager')) {
                this.loadPendingApprovals();
            }
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    }
};

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('approval_queue_manager')) {
        approvals.loadPendingApprovals();
    }
});