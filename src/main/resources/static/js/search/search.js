// 10-search.js
console.log('search.js загружен');

App.search = {
    perform: async function() {
        const query = document.getElementById('searchQuery').value.trim();
        const dateStr = document.getElementById('searchDate').value.trim();

        App.state.currentSearchQuery = query;
        App.state.currentSearchDate = dateStr;

        document.getElementById('appsTableBody').innerHTML = `
            <tr><td colspan="7" class="text-center p-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Поиск...</span>
                </div>
                <p class="mt-2">Выполняется поиск...</p>
            </td></tr>
        `;

        try {
            const response = await fetch('/api/corp/applications/search', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    query: query,
                    date: dateStr,
                    scope: 'all',
                    page: 0,
                    size: 100
                })
            });

            if (!response.ok) throw new Error('Ошибка поиска');

            const result = await response.json();
            App.state.searchResults = result.results;
            App.state.applications = result.results;

            App.ui.renderTable();

            const statsDiv = document.getElementById('searchStats');
            const exportBtn = document.getElementById('exportSearchBtn');
            const countSpan = document.getElementById('searchCount');
            const descSpan = document.getElementById('searchDescription');

            if (result.totalCount > 0 || query || dateStr) {
                statsDiv.style.display = 'block';
                countSpan.textContent = result.totalCount;

                let description = [];
                if (query) description.push(`запрос "${query}"`);
                if (dateStr) description.push(`дата ${dateStr}`);

                descSpan.textContent = description.length ? `Найдено по: ${description.join(', ')}` : '';
                exportBtn.style.display = 'inline-block';

                setTimeout(App.ui.scrollToLast, 300);
            } else {
                statsDiv.style.display = 'none';
                exportBtn.style.display = 'none';
            }

        } catch (error) {
            console.error('Ошибка поиска:', error);
            alert('Ошибка при выполнении поиска');
            App.state.applications = App.state.allApplications;
            App.ui.renderTable();
        }
    },

    reset: function() {
        document.getElementById('searchQuery').value = '';
        document.getElementById('searchDate').value = '';
        App.state.currentSearchQuery = '';
        App.state.currentSearchDate = '';
        App.state.searchResults = [];

        document.getElementById('searchStats').style.display = 'none';
        document.getElementById('exportSearchBtn').style.display = 'none';

        App.ui.applyFilter(App.state.currentFilter);
    },

    clear: function() {
        this.reset();
    }
};

window.performSearch = () => App.search.perform();
window.resetSearch = () => App.search.reset();
window.clearSearch = () => App.search.clear();