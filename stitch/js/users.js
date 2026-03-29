// users.js - User management
const users = {
    async loadUsers() {
        try {
            const data = await api.get('/users');
            const tbody = document.getElementById('userList');
            if (!tbody) return;
            tbody.innerHTML = '';

            data.forEach(user => {
                const tr = document.createElement('tr');
                tr.className = 'group hover:bg-surface-container-high transition-colors';
                tr.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-primary">
                                ${user.name.charAt(0)}
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-on-surface">${user.name}</p>
                                <p class="text-[10px] text-on-surface-variant">${user.email}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <select onchange="users.updateRole('${user._id}', this.value)" class="text-xs border-none bg-surface-container-low rounded-md px-2 py-1 focus:ring-1 focus:ring-primary">
                            <option value="Employee" ${user.role === 'Employee' ? 'selected' : ''}>Employee</option>
                            <option value="Manager" ${user.role === 'Manager' ? 'selected' : ''}>Manager</option>
                            <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </td>
                    <td class="px-6 py-4 text-sm text-on-surface-variant">
                        ${user.managerId ? user.managerId.name : '<span class="italic text-slate-400">None</span>'}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="users.delete('${user._id}')" class="p-2 text-on-surface-variant hover:text-error transition-colors">
                            <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    },

    async updateRole(id, role) {
        try {
            await api.patch(`/users/${id}/role`, { role });
            ui.showToast('User role updated successfully');
            this.loadUsers();
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    },

    async delete(id) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/users/${id}`);
            ui.showToast('User deleted successfully');
            this.loadUsers();
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    },

    async create(body) {
        try {
            await api.post('/users/create', body);
            ui.showToast('User created successfully');
            this.loadUsers();
            const modal = document.getElementById('userModal');
            if (modal) modal.classList.add('hidden');
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    }
};

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('users.html')) {
        users.loadUsers();
    }
});