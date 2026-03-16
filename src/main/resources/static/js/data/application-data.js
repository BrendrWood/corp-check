// 08-application-data.js
console.log('application-data.js загружен');

App.data = {
    loadAll: async function() {
        try {
            const response = await fetch('/api/corp/applications/recent?limit=100');
            if (!response.ok) throw new Error('Ошибка загрузки');

            App.state.applications = await response.json();
            App.state.allApplications = [...App.state.applications];

            App.state.applications.sort((a, b) => (a.id || 0) - (b.id || 0));
            App.state.allApplications.sort((a, b) => (a.id || 0) - (b.id || 0));

            if (App.ui?.applyFilter) App.ui.applyFilter(App.state.currentFilter);

            const countEl = document.getElementById('appsCount');
            if (countEl) countEl.textContent = App.state.applications.length;

            setTimeout(() => App.ui?.scrollToLast(), 300);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            // Показываем сообщение об ошибке в таблице
            document.getElementById('appsTableBody').innerHTML = `
                <tr><td colspan="7" class="text-center p-4 text-danger">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    Ошибка загрузки данных. Пожалуйста, обновите страницу.
                </td></tr>
            `;
        }
    },

    updateInTable: function(updatedApp) {
        if (!updatedApp?.id) return;

        const allIndex = App.state.allApplications.findIndex(a => a.id === updatedApp.id);
        if (allIndex !== -1) {
            App.state.allApplications[allIndex] = {...App.state.allApplications[allIndex], ...updatedApp};
        }

        const currentIndex = App.state.applications.findIndex(a => a.id === updatedApp.id);
        if (currentIndex !== -1) {
            App.state.applications[currentIndex] = {...App.state.applications[currentIndex], ...updatedApp};
        }

        this.updateTableRow(updatedApp);
    },

    updateTableRow: function(updatedApp) {
        const rows = document.querySelectorAll('#appsTableBody tr');
        for (let row of rows) {
            const appNumberCell = row.cells[1]?.querySelector('strong');
            if (appNumberCell && appNumberCell.textContent === updatedApp.applicationNumber) {
                row.cells[4].innerHTML = App.utils.formatStatus(updatedApp.stage1Status);
                row.cells[5].innerHTML = App.utils.formatStatus(updatedApp.stage2Status);
                row.style.backgroundColor = '#d4edda';
                setTimeout(() => row.style.backgroundColor = '', 1000);
                break;
            }
        }
    },

    delete: async function(id, event) {
        if (event) event.stopPropagation();
        if (!confirm('Удалить заявку?')) return;

        try {
            const response = await fetch(`/api/corp/applications/${id}`, { method: 'DELETE' });

            if (response.status === 204) {
                await this.loadAll();
                App.utils.showNotification('Заявка удалена');
            } else if (response.status === 404) {
                alert('Заявка не найдена');
            } else {
                const error = await response.text();
                alert('Ошибка удаления: ' + (error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления: ' + error.message);
        }
    }
};

window.loadApplications = () => App.data.loadAll();
window.updateApplicationInTable = (app) => App.data.updateInTable(app);
window.updateTableRow = (app) => App.data.updateTableRow(app);
window.deleteApp = (id, event) => App.data.delete(id, event);