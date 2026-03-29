// approval.js - Handles pending approvals logic
const approval = {
    async init() {
        this.loadPending();
    },

    async loadPending() {
        try {
            const approvals = await api.getPendingApprovals();
            const container = document.getElementById('approvalsContainer');
            
            if (!container) return;

            if (approvals.length === 0) {
                container.innerHTML = '<p>No pending approvals at this time.</p>';
                return;
            }

            container.innerHTML = approvals.map(exp => `
                <article id="exp-${exp._id}">
                    <header>
                        <strong>${exp.userId.name}</strong> (${exp.userId.email})
                    </header>
                    <div class="grid">
                        <div>
                            <p><strong>Category:</strong> ${exp.category}</p>
                            <p><strong>Amount:</strong> ${exp.amount} ${exp.originalCurrency}</p>
                            <p><strong>Converted:</strong> ${exp.convertedAmount.toFixed(2)} ${exp.companyCurrency}</p>
                        </div>
                        <div>
                            <p><strong>Date:</strong> ${new Date(exp.date).toLocaleDateString()}</p>
                            <p><strong>Description:</strong> ${exp.description || '-'}</p>
                            <a href="http://localhost:5000/${exp.receiptUrl}" target="_blank" class="secondary">View Receipt Image</a>
                        </div>
                    </div>
                    <footer>
                        <input type="text" id="comment-${exp._id}" placeholder="Add a comment (required for rejection)...">
                        <div class="grid">
                            <button class="outline" onclick="approval.handleReject('${exp._id}')">Reject</button>
                            <button onclick="approval.handleApprove('${exp._id}')">Approve</button>
                        </div>
                    </footer>
                </article>
            `).join('');
        } catch (error) {
            console.error('Failed to load approvals:', error);
        }
    },

    async handleApprove(id) {
        const comment = document.getElementById(`comment-${id}`).value;
        const btn = document.querySelector(`#exp-${id} button:not(.outline)`);

        try {
            btn.disabled = true;
            await api.approveExpense(id, comment);
            alert('Expense approved successfully!');
            this.loadPending();
        } catch (error) {
            alert(error.message);
            btn.disabled = false;
        }
    },

    async handleReject(id) {
        const comment = document.getElementById(`comment-${id}`).value;
        const btn = document.querySelector(`#exp-${id} .outline`);

        if (!comment) {
            alert('Please provide a comment for rejection.');
            return;
        }

        try {
            btn.disabled = true;
            await api.rejectExpense(id, comment);
            alert('Expense rejected.');
            this.loadPending();
        } catch (error) {
            alert(error.message);
            btn.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => approval.init());
