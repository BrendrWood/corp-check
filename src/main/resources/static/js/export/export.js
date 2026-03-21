// Функция экспорта заявок за сегодня (по дате монтажа)
function exportToday() {
    window.location.href = '/api/corp/applications/export/today';
}

// НОВАЯ ФУНКЦИЯ: Экспорт заявок, обработанных сегодня (созданных или отредактированных)
function exportProcessedToday() {
    window.location.href = '/api/corp/applications/export/processed-today';
}

// Функция экспорта по указанной дате
function exportByDate() {
    const date = document.getElementById('searchDate').value;
    if (!date) {
        showNotification('Введите дату в формате ДД.ММ.ГГГГ', 'warning');
        return;
    }
    window.location.href = '/api/corp/applications/export/date/' + date;
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ: Экспорт результатов поиска
function exportSearchResults() {
    console.log('exportSearchResults called');
    
    // Получаем результаты из App.state (основное хранилище)
    let results = null;
    
    // Пытаемся получить из разных источников
    if (window.App && window.App.state) {
        if (window.App.state.searchResults && window.App.state.searchResults.length > 0) {
            results = window.App.state.searchResults;
            console.log('Got results from App.state.searchResults:', results.length);
        } else if (window.App.state.applications && window.App.state.applications.length > 0 && 
                   (window.App.state.currentSearchQuery || window.App.state.currentSearchDate)) {
            results = window.App.state.applications;
            console.log('Got results from App.state.applications:', results.length);
        }
    }
    
    // Если не нашли через App, пробуем глобальную переменную
    if (!results && window.currentSearchResults && window.currentSearchResults.length > 0) {
        results = window.currentSearchResults;
        console.log('Got results from window.currentSearchResults:', results.length);
    }
    
    // Проверяем, есть ли результаты
    if (!results || results.length === 0) {
        console.log('No results to export');
        showNotification('Нет результатов для экспорта', 'warning');
        return;
    }

    try {
        const ids = results.map(app => app.id);
        console.log('Exporting IDs:', ids);
        
        // Создаем форму для отправки POST запроса
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/corp/applications/export/search';
        form.style.display = 'none';
        
        // Создаем input с ids
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'ids';
        input.value = JSON.stringify(ids);
        
        form.appendChild(input);
        document.body.appendChild(form);
        
        // Отправляем форму
        form.submit();
        
        // Удаляем форму после отправки (с небольшой задержкой)
        setTimeout(() => {
            if (document.body.contains(form)) {
                document.body.removeChild(form);
            }
        }, 100);
        
        console.log('Export request sent successfully');
        
    } catch (error) {
        console.error('Error exporting results:', error);
        showNotification('Ошибка при экспорте: ' + error.message, 'error');
    }
}

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    // Проверяем, существует ли функция глобально
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else if (typeof App !== 'undefined' && App.ui && App.ui.showNotification) {
        App.ui.showNotification(message, type);
    } else {
        console.log(`[${type}] ${message}`);
        alert(message);
    }
}
