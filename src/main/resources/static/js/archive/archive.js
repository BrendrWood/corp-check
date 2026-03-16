// 09-archive.js
console.log('archive.js загружен');

App.archive = {
    open: async function() {
        const searchTerm = prompt('Введите номер заявки, фамилию инженера или дату для поиска в архиве:', '');

        if (searchTerm === null) return;

        try {
            document.getElementById('appsTableBody').innerHTML = `
                <tr><td colspan="7" class="text-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Поиск в архиве...</span>
                    </div>
                    <p class="mt-2">Поиск в архиве: "${searchTerm}"</p>
                </td></tr>
            `;

            const response = await fetch(`/api/corp/applications/archive?search=${encodeURIComponent(searchTerm)}&page=0&size=50`);
            if (!response.ok) throw new Error('Ошибка поиска в архиве');

            const archiveResults = await response.json();

            if (archiveResults.length === 0) {
                alert('Ничего не найдено в архиве');
                App.ui.applyFilter(App.state.currentFilter);
                return;
            }

            App.state.applications = archiveResults;
            App.ui.renderTable();

            document.getElementById('searchStats').style.display = 'block';
            document.getElementById('searchCount').textContent = archiveResults.length;
            document.getElementById('searchDescription').textContent = `Результаты из архива по запросу "${searchTerm}"`;
            document.getElementById('exportSearchBtn').style.display = 'inline-block';

            setTimeout(App.ui.scrollToLast, 300);

        } catch (error) {
            console.error('Ошибка поиска в архиве:', error);
            alert('Ошибка при поиске в архиве');
        }
    }
};

window.openArchive = () => App.archive.open();