// expenses.js - Expense submission and details
const expenses = {
    async submit(formData) {
        try {
            const response = await api.post('/expenses', formData, true);
            ui.showToast('Expense submitted successfully!');
            router.navigateTo('submit_expense_employee/code.html');
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    },

    async scanReceipt(file) {
        const formData = new FormData();
        formData.append('receipt', file);
        try {
            const response = await api.post('/expenses/scan-receipt', formData, true);
            const data = response.data;
            
            if (data.amount) document.getElementById('amount').value = data.amount;
            if (data.date) document.getElementById('date').value = new Date(data.date).toISOString().split('T')[0];
            if (data.vendorName) document.getElementById('vendorName').value = data.vendorName;
            
            ui.showToast('OCR Scan complete');
            return data;
        } catch (error) {
            ui.showToast('OCR Failed', 'error');
            throw error;
        }
    },

    async loadExpenseHistory() {
        try {
            const data = await api.get('/expenses/my');
            const tbody = document.querySelector('tbody');
            if (!tbody) return;
            tbody.innerHTML = '';

            data.expenses.forEach(expense => {
                const tr = document.createElement('tr');
                tr.className = 'group hover:bg-surface-container-high transition-colors cursor-pointer';
                const statusClass = expense.status === 'Approved' ? 'bg-primary-container text-on-primary-container' : 
                                  expense.status === 'Rejected' ? 'bg-error-container text-on-error-container' : 
                                  'bg-secondary-container text-on-secondary-container';
                
                const currencySymbols = { 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£' };
                const symbol = currencySymbols[expense.companyCurrency] || '$';
                const origSymbol = currencySymbols[expense.originalCurrency] || '$';

                tr.innerHTML = `
                    <td class="px-6 py-4">
                        <p class="text-sm font-semibold text-on-surface">${expense.vendorName || 'General Expense'}</p>
                        <p class="text-[10px] text-on-surface-variant">${expense.category}</p>
                    </td>
                    <td class="px-6 py-4 text-sm text-on-surface-variant">${new Date(expense.date).toLocaleDateString()}</td>
                    <td class="px-6 py-4 text-right">
                        <p class="text-sm font-bold text-on-surface">${origSymbol}${expense.amount.toFixed(2)}</p>
                        <p class="text-[10px] text-on-surface-variant">${symbol}${expense.convertedAmount.toFixed(2)} ${expense.companyCurrency}</p>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="px-3 py-1 text-[10px] font-bold rounded-full ${statusClass}">${expense.status}</span>
                    </td>
                `;
                tr.onclick = () => router.navigateTo(`expenses/detail.html?id=${expense._id}`);
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Failed to load expense history:', error);
        }
    }
};

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('submit_expense_employee')) {
        expenses.loadExpenseHistory();
    }
});