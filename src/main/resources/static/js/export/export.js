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

// Функция экспорта результатов поиска
function exportSearchResults() {
    if (!currentSearchResults || currentSearchResults.length === 0) {
        showNotification('Нет результатов для экспорта', 'warning');
        return;
    }

    const ids = currentSearchResults.map(app => app.id);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/corp/applications/export/search';
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'ids';
    input.value = JSON.stringify(ids);

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

// Функция для показа уведомлений (если не определена в другом месте)
function showNotification(message, type = 'info') {
    // Проверяем, существует ли функция глобально
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.log(`[${type}] ${message}`);
        alert(message);
    }
}