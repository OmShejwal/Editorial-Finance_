// expense.js - Handles expense submission and history logic
const expense = {
    init() {
        this.setupEventListeners();
        if (window.location.pathname.includes('history.html')) {
            this.loadHistory();
        }
    },

    setupEventListeners() {
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const receiptInput = document.getElementById('receipt');
        if (receiptInput) {
            receiptInput.addEventListener('change', (e) => this.handleOCR(e));
        }
    },

    async handleOCR(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('receipt', file);

        try {
            const statusEl = document.getElementById('ocrStatus');
            if (statusEl) statusEl.textContent = 'Scanning receipt...';

            const response = await api.scanReceipt(formData);
            const data = response.data;

            if (data.amount) document.getElementById('amount').value = data.amount;
            if (data.date) document.getElementById('date').value = new Date(data.date).toISOString().split('T')[0];
            if (data.vendorName) document.getElementById('description').value = `Expense at ${data.vendorName}`;

            if (statusEl) statusEl.textContent = 'OCR complete! Fields populated.';
        } catch (error) {
            console.error('OCR Error:', error);
            const statusEl = document.getElementById('ocrStatus');
            if (statusEl) statusEl.textContent = 'OCR failed. Please enter manually.';
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            await api.createExpense(formData);
            alert('Expense submitted successfully!');
            window.location.href = 'history.html';
        } catch (error) {
            alert(error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Claim';
        }
    },

    async loadHistory() {
        try {
            const response = await api.getExpenses();
            const expenses = response.data;
            const tableBody = document.getElementById('historyTableBody');
            
            if (!tableBody) return;

            if (expenses.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No expenses found.</td></tr>';
                return;
            }

            tableBody.innerHTML = expenses.map(exp => `
                <tr>
                    <td>${new Date(exp.date).toLocaleDateString()}</td>
                    <td>${exp.category}</td>
                    <td>${exp.amount} ${exp.originalCurrency}</td>
                    <td>${exp.convertedAmount.toFixed(2)} ${exp.companyCurrency}</td>
                    <td>
                        <mark class="${this.getStatusColor(exp.status)}">
                            ${exp.status}
                        </mark>
                    </td>
                    <td>${exp.description || '-'}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    },

    getStatusColor(status) {
        switch (status) {
            case 'Pending': return 'secondary'; // Yellow-ish in Pico
            case 'Approved': return 'primary';   // Green-ish
            case 'Rejected': return 'error';     // Red
            default: return '';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => expense.init());
