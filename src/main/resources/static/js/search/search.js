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
            </td>
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
            
            // СОХРАНЯЕМ РЕЗУЛЬТАТЫ В ГЛОБАЛЬНУЮ ПЕРЕМЕННУЮ ДЛЯ ЭКСПОРТА
            window.currentSearchResults = result.results;
            
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
                
                // ПОКАЗЫВАЕМ КНОПКУ ЭКСПОРТА
                if (exportBtn) {
                    exportBtn.style.display = 'inline-block';
                    console.log('Export button shown, results count:', result.results.length);
                }

                setTimeout(App.ui.scrollToLast, 300);
            } else {
                statsDiv.style.display = 'none';
                if (exportBtn) {
                    exportBtn.style.display = 'none';
                }
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
        
        // ОЧИЩАЕМ ГЛОБАЛЬНУЮ ПЕРЕМЕННУЮ
        window.currentSearchResults = [];

        const statsDiv = document.getElementById('searchStats');
        const exportBtn = document.getElementById('exportSearchBtn');
        
        if (statsDiv) statsDiv.style.display = 'none';
        if (exportBtn) exportBtn.style.display = 'none';

        App.ui.applyFilter(App.state.currentFilter);
    },

    clear: function() {
        this.reset();
    }
};

window.performSearch = () => App.search.perform();
window.resetSearch = () => App.search.reset();
window.clearSearch = () => App.search.clear();

// Добавляем функцию для ручного вызова экспорта из консоли для отладки
window.debugExport = function() {
    console.log('=== DEBUG EXPORT ===');
    console.log('window.currentSearchResults:', window.currentSearchResults);
    console.log('App.state.searchResults:', App.state.searchResults);
    console.log('App.state.applications:', App.state.applications);
    console.log('App.state.currentSearchQuery:', App.state.currentSearchQuery);
    console.log('App.state.currentSearchDate:', App.state.currentSearchDate);
    
    const exportBtn = document.getElementById('exportSearchBtn');
    console.log('Export button display:', exportBtn ? exportBtn.style.display : 'button not found');
    
    return {
        hasResults: !!(window.currentSearchResults && window.currentSearchResults.length),
        resultsCount: window.currentSearchResults ? window.currentSearchResults.length : 0
    };
};
