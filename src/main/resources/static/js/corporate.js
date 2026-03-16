// corporate.js - ПОЛНАЯ ВЕРСИЯ С ИСПРАВЛЕННОЙ ПРОКРУТКОЙ ЧАТА
console.log('corporate.js загружен');

let applications = [];
let allApplications = [];
let currentApp = null;
let stompClient = null;
let currentUser = document.querySelector('meta[name="username"]')?.content || 'guest';
let currentFilter = 'all';
let currentSearchQuery = '';
let currentSearchDate = '';
let searchResults = [];

// Глобальные переменные для комментариев
let autoCommentsStage1 = [];
let autoCommentsStage2 = [];
let manualCommentStage1 = '';
let manualCommentStage2 = '';
let commentsInitialized = false;

// Переменные для чата
let chatVisible = false;
let unreadMessages = 0;

// Хранилище активных подписок
let activeSubscriptions = new Map();

// ID текущей заблокированной заявки
let currentlyLockedApplicationId = null;

// Хранилище просматривающих пользователей для каждой заявки
let applicationViewers = new Map();

// Режим следования за коллегой
let followMode = false;
let followingUser = null;

// Флаг для автоматической прокрутки чата
let shouldAutoScrollChat = true;

// Таймер для отправки изменений полей (debounce)
let fieldChangeTimer = null;

// ========== РАСТЯГИВАНИЕ ЧАТА ==========

function initResizable() {
    const chatWindow = document.getElementById('chatWindow');
    const resizeHandle = document.getElementById('resizeHandle');
    let startX, startY, startWidth, startHeight;

    if (!chatWindow || !resizeHandle) return;

    resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(chatWindow).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(chatWindow).height, 10);

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });

    function resize(e) {
        const width = startWidth + (e.clientX - startX);
        const height = startHeight + (e.clientY - startY);

        // Ограничиваем максимальную высоту 400px
        const newHeight = Math.min(Math.max(300, height), 400);

        chatWindow.style.width = Math.max(250, width) + 'px';
        chatWindow.style.height = newHeight + 'px';

        // Обновляем высоту контейнера сообщений сразу при изменении размера
        updateChatMessagesHeight();
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);

        // Принудительно обновляем высоту и прокрутку после завершения изменения размера
        setTimeout(() => {
            updateChatMessagesHeight();
            scrollChatToBottom();
        }, 50);
    }
}

// Функция для обновления высоты контейнера сообщений
function updateChatMessagesHeight() {
    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const chatHeader = document.querySelector('.chat-header');
    const chatFooter = document.querySelector('.chat-footer');

    if (chatWindow && chatMessages && chatHeader && chatFooter) {
        const windowHeight = chatWindow.clientHeight;
        const headerHeight = chatHeader.offsetHeight;
        const footerHeight = chatFooter.offsetHeight;
        const messagesHeight = windowHeight - headerHeight - footerHeight - 2; // Вычитаем 2px для границ

        chatMessages.style.height = messagesHeight + 'px';
        chatMessages.style.maxHeight = messagesHeight + 'px';
        console.log('Высота чата обновлена:', messagesHeight);
    }
}

// Перетаскивание чата
function initDraggable() {
    const chatWindow = document.getElementById('chatWindow');
    const chatHeader = document.getElementById('chatHeader');
    let offsetX, offsetY;

    if (!chatWindow || !chatHeader) return;

    chatHeader.addEventListener('mousedown', function(e) {
        e.preventDefault();
        offsetX = e.clientX - chatWindow.getBoundingClientRect().left;
        offsetY = e.clientY - chatWindow.getBoundingClientRect().top;

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    });

    function drag(e) {
        chatWindow.style.left = (e.clientX - offsetX) + 'px';
        chatWindow.style.top = (e.clientY - offsetY) + 'px';
        chatWindow.style.transform = 'none';
    }

    function stopDrag() {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
}

// ========== ЧАТ ==========

// Переключение чата
window.toggleChat = function(event) {
    if (event) event.stopPropagation();
    chatVisible = !chatVisible;
    const chatWindow = document.getElementById('chatWindow');
    const chatToggle = document.getElementById('chatToggle');

    if (chatWindow && chatToggle) {
        if (chatVisible) {
            chatWindow.style.display = 'block';
            chatToggle.innerHTML = '<i class="bi bi-chat-dots-fill"></i>';
            // Сбрасываем счетчик непрочитанных
            unreadMessages = 0;
            const unreadBadge = document.getElementById('unreadBadge');
            if (unreadBadge) unreadBadge.style.display = 'none';

            // Обновляем высоту контейнера сообщений
            setTimeout(() => {
                updateChatMessagesHeight();
                loadChatHistory();
            }, 100);
        } else {
            chatWindow.style.display = 'none';
            chatToggle.innerHTML = '<i class="bi bi-chat-dots"></i>';
        }
    }
};

// Загрузка истории чата
function loadChatHistory() {
    if (!stompClient || !stompClient.connected) {
        console.log('WebSocket не подключен, ждем...');
        setTimeout(loadChatHistory, 1000);
        return;
    }

    console.log('Загрузка истории чата для пользователя:', currentUser);

    const subKey = 'chatHistory_' + currentUser;

    if (activeSubscriptions.has(subKey)) {
        const oldSub = activeSubscriptions.get(subKey);
        if (oldSub && oldSub.unsubscribe) {
            oldSub.unsubscribe();
            console.log('Отписались от старой истории чата для', currentUser);
        }
        activeSubscriptions.delete(subKey);
    }

    const subscription = stompClient.subscribe('/user/queue/chat.history', function(history) {
        try {
            const messages = JSON.parse(history.body);
            console.log('📜 История чата получена для', currentUser + ':', messages.length, 'сообщений');

            const container = document.getElementById('chatMessages');
            if (!container) return;

            container.innerHTML = '';

            if (!messages || messages.length === 0) {
                container.innerHTML = '<div class="text-center text-muted p-2">Нет сообщений</div>';
                return;
            }

            // Сортируем сообщения по времени (от старых к новым)
            const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);

            sortedMessages.forEach(msg => {
                addMessageToChat(msg.username, msg.message, msg.timestamp);
            });

            // Прокручиваем вниз к последним сообщениям
            setTimeout(() => {
                if (container) {
                    container.scrollTop = container.scrollHeight;
                    console.log('Прокрутка чата вниз, scrollHeight:', container.scrollHeight);
                }
            }, 200);

        } catch (e) {
            console.error('Ошибка обработки истории чата:', e);
        }
    });

    activeSubscriptions.set(subKey, subscription);
    console.log('✅ Подписались на историю чата для', currentUser);

    stompClient.send("/app/chat.history", {}, {});
    console.log('Запрос истории отправлен для', currentUser);
}

// Отправка сообщения
window.sendMessage = function() {
    const input = document.getElementById('chatInput');
    if (!input) return;

    const message = input.value.trim();
    if (!message || !stompClient) return;

    stompClient.send("/app/chat.send", {}, JSON.stringify({
        message: message
    }));

    input.value = '';
};

// Вспомогательная функция для добавления сообщения в чат
function addMessageToChat(username, message, timestamp) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const isOwn = username === currentUser;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isOwn ? 'own' : 'other'} mb-1`;

    const time = new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });

    msgDiv.innerHTML = `
        <div class="message-bubble ${isOwn ? 'bg-primary text-white' : 'bg-light'} p-1 px-2 rounded"
             style="max-width: 80%; ${isOwn ? 'margin-left: auto;' : ''}; font-size: 0.9rem;">
            <small class="d-flex justify-content-between" style="font-size: 0.7rem; line-height: 1.2;">
                <span class="fw-bold">${isOwn ? 'Вы' : escapeHtml(username)}</span>
                <span class="small opacity-75">${time}</span>
            </small>
            <div class="mt-0" style="line-height: 1.3;">${escapeHtml(message || '')}</div>
        </div>
    `;

    container.appendChild(msgDiv);
}

// Функция для прокрутки чата вниз
function scrollChatToBottom() {
    const container = document.getElementById('chatMessages');
    if (container) {
        // Сначала обновляем высоту, чтобы scrollHeight был актуальным
        updateChatMessagesHeight();

        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 10);
    }
}

// Отображение сообщения
function displayMessage(data) {
    console.log('💬 Получено сообщение:', data);

    // Добавляем сообщение в чат
    addMessageToChat(data.username, data.data?.message, data.timestamp);

    // Прокручиваем вниз для нового сообщения
    scrollChatToBottom();

    // Если чат скрыт и сообщение не свое, показываем уведомление
    if (!chatVisible && data.username !== currentUser) {
        unreadMessages++;
        const unreadBadge = document.getElementById('unreadBadge');
        if (unreadBadge) {
            unreadBadge.style.display = 'inline';
            unreadBadge.textContent = unreadMessages;
        }
    }
}

// Отслеживание прокрутки чата пользователем
function initChatScrollListener() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    container.addEventListener('scroll', function() {
        // Если пользователь прокрутил вверх, отключаем автоматическую прокрутку
        const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
        shouldAutoScrollChat = isScrolledToBottom;
    });
}

// Кнопка для принудительной прокрутки вниз
window.scrollChatToBottomForce = function() {
    shouldAutoScrollChat = true;
    const container = document.getElementById('chatMessages');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
};

// ========== НОВЫЕ ФУНКЦИИ ДЛЯ СОВМЕСТНОЙ РАБОТЫ ==========

// 1. ИНДИКАТОРЫ "КТО СМОТРИТ"
function notifyApplicationView(applicationId) {
    if (!stompClient || !stompClient.connected || !applicationId) return;

    console.log('👁️ Отправляем уведомление о просмотре заявки:', applicationId);

    stompClient.send("/app/application.view", {}, JSON.stringify({
        applicationId: applicationId,
        username: currentUser,
        timestamp: Date.now()
    }));
}

function notifyApplicationLeave(applicationId) {
    if (!stompClient || !stompClient.connected || !applicationId) return;

    console.log('👋 Отправляем уведомление о выходе из заявки:', applicationId);

    stompClient.send("/app/application.leave", {}, JSON.stringify({
        applicationId: applicationId
    }));
}

function updateViewersList(data) {
    console.log('👁️ Обновление списка просматривающих:', data);

    const viewersContainer = document.getElementById('applicationViewers');
    if (!viewersContainer) return;

    const viewers = data.viewers || {};

    // Фильтруем только реальных пользователей (исключаем текущего)
    const viewerNames = Object.keys(viewers).filter(name =>
        name && name !== 'null' && name !== 'undefined' && name !== currentUser
    );

    console.log('📋 Имена просматривающих (после фильтрации):', viewerNames);

    if (viewerNames.length === 0) {
        viewersContainer.style.display = 'none';
        return;
    }

    viewersContainer.style.display = 'flex';

    // Очищаем контейнер
    viewersContainer.innerHTML = '';

    // Добавляем иконку
    const icon = document.createElement('i');
    icon.className = 'bi bi-eye-fill me-1';
    icon.style.color = '#4361ee';
    viewersContainer.appendChild(icon);

    // Добавляем текст "Смотрят:"
    const text = document.createElement('span');
    text.className = 'me-1';
    text.textContent = 'Смотрят:';
    viewersContainer.appendChild(text);

    // Добавляем бейджи с именами
    viewerNames.forEach(name => {
        const badge = document.createElement('span');
        badge.className = 'viewer-badge ms-1';
        badge.title = `Просматривает с ${new Date(viewers[name]).toLocaleTimeString()}`;
        badge.textContent = name;
        viewersContainer.appendChild(badge);
    });
}

// 2. МГНОВЕННОЕ ОБНОВЛЕНИЕ ПРИ СОХРАНЕНИИ
function updateApplicationInTable(updatedApp) {
    console.log('📝 Обновление заявки в таблице:', updatedApp);

    if (!updatedApp || !updatedApp.id) return;

    // Обновляем в массиве allApplications
    const allIndex = allApplications.findIndex(a => a.id === updatedApp.id);
    if (allIndex !== -1) {
        allApplications[allIndex] = {...allApplications[allIndex], ...updatedApp};
    }

    // Обновляем в текущем отфильтрованном списке
    const currentIndex = applications.findIndex(a => a.id === updatedApp.id);
    if (currentIndex !== -1) {
        applications[currentIndex] = {...applications[currentIndex], ...updatedApp};
    }

    // Обновляем строку в таблице
    updateTableRow(updatedApp);
}

function updateTableRow(updatedApp) {
    const rows = document.querySelectorAll('#appsTableBody tr');
    for (let row of rows) {
        const appNumberCell = row.cells[1]?.querySelector('strong');
        if (appNumberCell && appNumberCell.textContent === updatedApp.applicationNumber) {
            // Обновляем статусы
            row.cells[4].innerHTML = formatStatus(updatedApp.stage1Status);
            row.cells[5].innerHTML = formatStatus(updatedApp.stage2Status);

            // Добавляем анимацию обновления
            row.style.backgroundColor = '#d4edda';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 1000);
            break;
        }
    }
}

// 3. ФУНКЦИИ ДЛЯ АВТООБНОВЛЕНИЯ ПОЛЕЙ В РЕАЛЬНОМ ВРЕМЕНИ

// Отправка изменения поля (с debounce)
function notifyFieldChange(applicationId, field, value) {
    if (!stompClient || !stompClient.connected || !applicationId || !currentApp) return;

    // Очищаем предыдущий таймер
    if (fieldChangeTimer) {
        clearTimeout(fieldChangeTimer);
    }

    // Устанавливаем новый таймер для отправки через 500мс после последнего изменения
    fieldChangeTimer = setTimeout(() => {
        console.log('✏️ Отправляем изменение поля:', field, '=', value);

        stompClient.send("/app/field.change", {}, JSON.stringify({
            applicationId: applicationId,
            field: field,
            value: value,
            username: currentUser,
            timestamp: Date.now()
        }));

        fieldChangeTimer = null;
    }, 500);
}

// Обновление поля в модальном окне
function updateFieldFromChange(change) {
    if (change.username === currentUser) return; // Игнорируем свои изменения
    if (!currentApp || currentApp.id !== change.applicationId) return; // Не та заявка

    console.log('🔄 Обновление поля от пользователя', change.username, ':', change.field, '=', change.value);

    const field = document.getElementById(change.field);
    if (!field) return;

    // Обновляем значение поля в зависимости от типа
    if (field.type === 'checkbox') {
        field.checked = change.value === true || change.value === 'true';
    } else {
        field.value = change.value || '';
    }

    // Подсвечиваем измененное поле
    field.classList.add('field-highlight');
    setTimeout(() => {
        field.classList.remove('field-highlight');
    }, 1000);

    // Если поле связано с комментариями, обновляем комментарии
    const commentRelatedFields = ['panicSignal', 'csmSignal', 'arming', 'backup', 'photos', 'form002', 'avr', 'roads', 'plan', 'electronic'];
    if (commentRelatedFields.includes(change.field)) {
        if (change.field.startsWith('panic') || change.field.startsWith('csm') || change.field.startsWith('arming') || change.field.startsWith('backup')) {
            updateStage1Comment();
        } else {
            updateStage2Comment();
        }
    }
}

// ========== WEBSOCKET ПОДПИСКИ ==========

// Подписка на блокировки конкретной заявки
function subscribeToApplicationLocks(applicationId) {
    if (!stompClient || !stompClient.connected) return;

    const subKey = 'lock_' + applicationId;

    if (activeSubscriptions.has(subKey)) {
        const oldSub = activeSubscriptions.get(subKey);
        if (oldSub && oldSub.unsubscribe) {
            oldSub.unsubscribe();
            console.log('Отписались от старой подписки на заявку:', applicationId);
        }
    }

    const subscription = stompClient.subscribe('/topic/editing/' + applicationId, function(lockUpdate) {
        try {
            const data = JSON.parse(lockUpdate.body);
            console.log('🔥 Получено обновление блокировки для заявки ' + applicationId + ':', data);
            handleEditingStatus(data);
        } catch (e) {
            console.error('Ошибка парсинга сообщения блокировки:', e);
        }
    });

    activeSubscriptions.set(subKey, subscription);
    console.log('✅ Подписались на блокировки заявки:', applicationId);
}

// Подписка на просматривающих пользователей
function subscribeToApplicationViewers(applicationId) {
    if (!stompClient || !stompClient.connected) return;

    const subKey = 'viewers_' + applicationId;

    if (activeSubscriptions.has(subKey)) {
        const oldSub = activeSubscriptions.get(subKey);
        if (oldSub && oldSub.unsubscribe) {
            oldSub.unsubscribe();
        }
    }

    const subscription = stompClient.subscribe('/topic/application/' + applicationId + '/viewers', function(viewers) {
        try {
            const data = JSON.parse(viewers.body);
            console.log('👁️ Обновление списка просматривающих:', data);
            updateViewersList(data);
        } catch (e) {
            console.error('Ошибка парсинга списка просматривающих:', e);
        }
    });

    activeSubscriptions.set(subKey, subscription);
}

// Подписка на обновления заявок
function subscribeToApplicationUpdates() {
    if (!stompClient || !stompClient.connected) return;

    const subKey = 'application_updates';

    if (activeSubscriptions.has(subKey)) {
        return; // Уже подписаны
    }

    const subscription = stompClient.subscribe('/topic/application/updates', function(update) {
        try {
            const data = JSON.parse(update.body);
            console.log('📝 Получено обновление заявки:', data);
            updateApplicationInTable(data);
        } catch (e) {
            console.error('Ошибка обработки обновления заявки:', e);
        }
    });

    activeSubscriptions.set(subKey, subscription);
}

// Подписка на изменения полей
function subscribeToFieldChanges(applicationId) {
    if (!stompClient || !stompClient.connected) return;

    const subKey = 'field_changes_' + applicationId;

    if (activeSubscriptions.has(subKey)) {
        const oldSub = activeSubscriptions.get(subKey);
        if (oldSub && oldSub.unsubscribe) {
            oldSub.unsubscribe();
        }
    }

    const subscription = stompClient.subscribe('/topic/application/' + applicationId + '/changes', function(change) {
        try {
            const data = JSON.parse(change.body);
            console.log('✏️ Изменение поля:', data);
            updateFieldFromChange(data);
        } catch (e) {
            console.error('Ошибка обработки изменения поля:', e);
        }
    });

    activeSubscriptions.set(subKey, subscription);
}

// Подписка на синхронизацию прокрутки
function subscribeToScrollSync(applicationId) {
    if (!stompClient || !stompClient.connected) return;

    const subKey = 'scroll_' + applicationId;

    if (activeSubscriptions.has(subKey)) {
        const oldSub = activeSubscriptions.get(subKey);
        if (oldSub && oldSub.unsubscribe) {
            oldSub.unsubscribe();
        }
    }

    const subscription = stompClient.subscribe('/topic/application/' + applicationId + '/scroll', function(scroll) {
        try {
            const data = JSON.parse(scroll.body);
            if (followMode && data.username !== currentUser) {
                const modalBody = document.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.scrollTop = data.position;
                }
            }
        } catch (e) {
            console.error('Ошибка синхронизации прокрутки:', e);
        }
    });

    activeSubscriptions.set(subKey, subscription);
}

// Снятие блокировки с текущей заявки
function releaseCurrentApplicationLock() {
    if (currentlyLockedApplicationId && stompClient && stompClient.connected) {
        console.log('Снимаем блокировку с заявки:', currentlyLockedApplicationId);
        stompClient.send("/app/edit.end", {}, JSON.stringify({
            applicationId: currentlyLockedApplicationId,
            stage: "all"
        }));
        currentlyLockedApplicationId = null;
    }
}

// ========== БЛОКИРОВКИ ==========

// Обработка статуса редактирования
function handleEditingStatus(data) {
    console.log('Статус редактирования (полные данные):', JSON.stringify(data, null, 2));

    const modalEditInfo = document.getElementById('modalEditInfo');
    const modalEditUser = document.getElementById('modalEditUser');
    const lockIndicator = document.getElementById('lockIndicator');
    const lockOwnerSpan = document.getElementById('lockOwner');

    if (data.applicationId === currentApp?.id) {
        if (modalEditInfo && modalEditUser) {
            const owner = data.lockOwner || data.username || data.data?.lockOwner;

            console.log('Владелец блокировки:', owner, 'Текущий пользователь:', currentUser);

            if (owner && owner !== currentUser) {
                modalEditInfo.style.display = 'block';
                modalEditUser.textContent = owner;
                disableModalFields(true);

                if (lockIndicator && lockOwnerSpan) {
                    lockIndicator.style.display = 'flex';
                    lockOwnerSpan.textContent = owner + ' редактирует эту заявку';
                }
                console.log('🔒 Заявка заблокирована пользователем:', owner);
            }
            else {
                modalEditInfo.style.display = 'none';
                disableModalFields(false);
                if (lockIndicator) {
                    lockIndicator.style.display = 'none';
                }
                console.log('🔓 Блокировка снята или принадлежит текущему пользователю');
            }
        }
    }
}

// Блокировка полей модального окна
function disableModalFields(disabled) {
    const fields = [
        'appNumber', 'engineerName', 'installDate', 'panelNumberAssigned',
        'panelSerial', 'gsmLevel', 'sensorPhoto', 'panicSignal', 'csmSignal',
        'instruction', 'arming', 'backup', 'ceilings', 'stage1Date',
        'stage1Inspector', 'stage1Comment', 'rental', 'sticker', 'photos',
        'form002', 'avr', 'defect', 'roads', 'plan', 'fireAlarm',
        'electronic', 'issues', 'incomplete', 'rentalComment',
        'fireAlarmChecklist', 'stage2Date', 'stage2Inspector', 'stage2Comment'
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = disabled;
            if (disabled) {
                el.style.backgroundColor = '#f5f5f5';
                el.style.cursor = 'not-allowed';
            } else {
                el.style.backgroundColor = '';
                el.style.cursor = '';
            }
        }
    });

    document.querySelectorAll('.btn-group .btn, .btn-primary, .btn-success, .btn-danger, .btn-outline-success, .btn-outline-danger, .btn-secondary').forEach(btn => {
        btn.disabled = disabled;
        if (disabled) {
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        } else {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }
    });

    document.querySelectorAll('.form-check-input').forEach(cb => {
        cb.disabled = disabled;
    });
}

// ========== ЭКСПОРТ ==========

window.exportToday = function() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}.${month}.${year}`;

    window.open(`/api/corp/applications/export/date/${dateStr}`, '_blank');
};

window.exportByDate = function() {
    const dateStr = document.getElementById('searchDate').value;
    if (!dateStr) {
        alert('Введите дату в формате ДД.ММ.ГГГГ');
        return;
    }
    window.open(`/api/corp/applications/export/date/${dateStr}`, '_blank');
};

window.exportSearchResults = function() {
    if (!searchResults || searchResults.length === 0) {
        alert('Нет результатов для экспорта');
        return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/corp/applications/export/search';
    form.target = '_blank';
    form.style.display = 'none';

    const ids = searchResults.map(app => app.id);
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'ids';
    input.value = JSON.stringify(ids);
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
        document.body.removeChild(form);
    }, 1000);
};

// ========== АРХИВ ==========
window.openArchive = async function() {
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
            applyFilter(currentFilter);
            return;
        }

        applications = archiveResults;
        renderTable();

        document.getElementById('searchStats').style.display = 'block';
        document.getElementById('searchCount').textContent = archiveResults.length;
        document.getElementById('searchDescription').textContent = `Результаты из архива по запросу "${searchTerm}"`;
        document.getElementById('exportSearchBtn').style.display = 'inline-block';

        setTimeout(scrollToLastApplication, 300);

    } catch (error) {
        console.error('Ошибка поиска в архиве:', error);
        alert('Ошибка при поиске в архиве');
    }
};

// ========== ПОИСК ==========

window.performSearch = async function() {
    const query = document.getElementById('searchQuery').value.trim();
    const dateStr = document.getElementById('searchDate').value.trim();

    currentSearchQuery = query;
    currentSearchDate = dateStr;

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
        searchResults = result.results;
        applications = result.results;

        renderTable();

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

            setTimeout(scrollToLastApplication, 300);
        } else {
            statsDiv.style.display = 'none';
            exportBtn.style.display = 'none';
        }

    } catch (error) {
        console.error('Ошибка поиска:', error);
        alert('Ошибка при выполнении поиска');
        applications = allApplications;
        renderTable();
    }
};

window.resetSearch = function() {
    document.getElementById('searchQuery').value = '';
    document.getElementById('searchDate').value = '';
    currentSearchQuery = '';
    currentSearchDate = '';
    searchResults = [];

    document.getElementById('searchStats').style.display = 'none';
    document.getElementById('exportSearchBtn').style.display = 'none';

    applyFilter(currentFilter);
};

window.clearSearch = function() {
    resetSearch();
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация...');

    initResizable();
    initDraggable();
    initChatScrollListener();

    connectWebSocket();
    loadApplications();
    initTheme();

    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', function(e) {
            toggleTheme(e.target.checked);
        });
    }

    document.addEventListener('click', function(event) {
        const chatWindow = document.getElementById('chatWindow');
        const chatToggle = document.getElementById('chatToggle');
        const onlineUsers = document.getElementById('onlineUsers');

        if (chatVisible && chatWindow && chatToggle && onlineUsers &&
            !chatWindow.contains(event.target) &&
            !chatToggle.contains(event.target) &&
            !onlineUsers.contains(event.target)) {
            toggleChat();
        }
    });

    const appModal = document.getElementById('appModal');
    if (appModal) {
        appModal.addEventListener('hidden.bs.modal', function() {
            console.log('Модальное окно закрыто');

            // Уведомляем о выходе из заявки
            if (currentApp) {
                notifyApplicationLeave(currentApp.id);
            }

            // Снимаем блокировку
            releaseCurrentApplicationLock();

            // Сбрасываем текущую заявку
            currentApp = null;
        });
    }
});

// ========== WEBSOCKET ==========
function connectWebSocket() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function() {
        console.log('✅ WebSocket подключен');

        // Подписка на обновления заявок
        stompClient.subscribe('/topic/applications', function(update) {
            console.log('Обновление заявок:', update);
            loadApplications();
        });

        // Подписка на онлайн пользователей
        stompClient.subscribe('/topic/users', function(users) {
            const data = JSON.parse(users.body);
            updateOnlineUsers(data);
        });

        // Подписка на чат
        stompClient.subscribe('/topic/chat', function(chatMessage) {
            const data = JSON.parse(chatMessage.body);
            console.log('Сообщение чата:', data);
            displayMessage(data);
        });

        // Подписка на обновления заявок (новый топик)
        subscribeToApplicationUpdates();

        // Подписка на личные сообщения
        stompClient.subscribe('/user/queue/reply', function(message) {
            const data = JSON.parse(message.body);
            console.log('📬 Личное сообщение:', data);

            if (data.type === 'LOCK') {
                if (data.action === 'CHECK' && data.lockOwner && data.lockOwner !== currentUser) {
                    if (currentApp && currentApp.id === data.applicationId) {
                        handleEditingStatus(data);
                    }
                } else if (data.action === 'LOCK_FAILED') {
                    alert(data.data?.message || 'Не удалось заблокировать заявку');
                } else if (data.action === 'OWNER') {
                    console.log('Блокировка принадлежит текущему пользователю');
                }
            }
        });

        stompClient.subscribe('/user/queue/chat.history', function(history) {
            console.log('📬 Получена история чата через личную очередь (запасной канал)');
        });

        stompClient.send("/app/user.connect", {}, JSON.stringify({
            username: currentUser
        }));

        setTimeout(() => {
            console.log('Первоначальная загрузка истории чата для', currentUser);
            loadChatHistory();
        }, 1000);

    }, function(error) {
        console.error('❌ Ошибка WebSocket:', error);
        setTimeout(connectWebSocket, 5000);
    });
}

// ========== ЗАГРУЗКА ДАННЫХ ==========
async function loadApplications() {
    try {
        const response = await fetch('/api/corp/applications/recent?limit=100');
        if (!response.ok) throw new Error('Ошибка загрузки');
        applications = await response.json();
        allApplications = [...applications];
        applications.sort((a, b) => (a.id || 0) - (b.id || 0));
        allApplications.sort((a, b) => (a.id || 0) - (b.id || 0));
        applyFilter(currentFilter);
        document.getElementById('appsCount').textContent = applications.length;

        setTimeout(scrollToLastApplication, 300);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// ========== ПРИМЕНЕНИЕ ФИЛЬТРА ==========
function applyFilter(filter) {
    currentFilter = filter;

    const chips = document.querySelectorAll('.filter-chips .chip');
    chips.forEach(chip => {
        chip.classList.remove('active');
    });

    const activeChip = document.querySelector(`.filter-chips .chip[onclick*="'${filter}'"]`);
    if (activeChip) activeChip.classList.add('active');

    let filtered = [];

    switch(filter) {
        case 'all':
            filtered = allApplications;
            break;
        case 'stage1':
            filtered = allApplications.filter(a =>
                !a.stage1Status || a.stage1Status === 'NOK'
            );
            break;
        case 'stage2':
            filtered = allApplications.filter(a =>
                a.stage1Status === 'OK' && (!a.stage2Status || a.stage2Status === 'NOK')
            );
            break;
        case 'problems':
            filtered = allApplications.filter(a =>
                a.stage1Status === 'NOK' || a.stage2Status === 'NOK'
            );
            break;
        case 'completed':
            filtered = allApplications.filter(a =>
                a.stage1Status === 'OK' && a.stage2Status === 'OK'
            );
            break;
        default:
            filtered = allApplications;
    }

    applications = filtered;
    renderTable();
    document.getElementById('appsCount').textContent = applications.length;

    setTimeout(scrollToLastApplication, 300);
}

window.filterApps = function(filter) {
    applyFilter(filter);
};

function scrollToLastApplication() {
    const tableContainer = document.querySelector('.card-body div[style*="overflow-y"]');
    if (tableContainer) {
        tableContainer.scrollTop = tableContainer.scrollHeight;
        console.log('Прокрутка к последней заявке');
    }
}

function renderTable() {
    const tbody = document.getElementById('appsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    applications.forEach((app, index) => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => openEditModal(app.id);

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(app.applicationNumber || '')}</strong></td>
            <td>${escapeHtml(app.engineerName || '')}</td>
            <td>${formatDateForDisplay(app.installationDate)}</td>
            <td>${formatStatus(app.stage1Status)}</td>
            <td>${formatStatus(app.stage2Status)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteApp(${app.id}, event)">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ========== ФОРМАТИРОВАНИЕ ==========
function formatDateForDisplay(date) {
    if (!date) return '';
    if (typeof date === 'string' && date.includes('-')) {
        const [y, m, d] = date.split('T')[0].split('-');
        return `${d}.${m}.${y}`;
    }
    return date;
}

function formatDateForInput(date) {
    if (!date) return '';
    if (typeof date === 'string' && date.includes('-')) {
        return date.split('T')[0];
    }
    return date;
}

function formatDateForStorage(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('.')) {
        const [d, m, y] = dateStr.split('.');
        return `${y}-${m}-${d}`;
    }
    return dateStr;
}

function parsePastedDate(input) {
    input = input.trim();

    const shortYearRegex = /^(\d{2})\.(\d{2})\.(\d{2})$/;
    const match = input.match(shortYearRegex);

    if (match) {
        const day = match[1];
        const month = match[2];
        let year = match[3];

        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        year = currentCentury + parseInt(year);

        if (year > currentYear + 1) {
            year = year - 100;
        }

        return `${day}.${month}.${year}`;
    }

    const fullYearRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const fullMatch = input.match(fullYearRegex);

    if (fullMatch) {
        return input;
    }

    return input;
}

function formatStatus(status) {
    if (!status) return '<span class="badge bg-secondary">...</span>';
    if (status === 'OK') return '<span class="badge bg-success">OK</span>';
    return '<span class="badge bg-danger">NOK</span>';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ГЕНЕРАЦИЯ КОММЕНТАРИЕВ ==========

function generateStage1Comments() {
    const comments = [];

    if (!document.getElementById('panicSignal')?.checked) {
        comments.push('тип тревоги КТС должен быть 120 или 122 (тихая тревога)');
    }
    if (!document.getElementById('csmSignal')?.checked) {
        comments.push('не поступали сигналы КТС');
    }
    if (!document.getElementById('arming')?.checked) {
        comments.push('не поступали сигналы постановки/снятия с охраны без тревог');
    }
    if (!document.getElementById('backup')?.checked) {
        comments.push('не поступал сигнал переключения системы на резервный источник питания');
    }

    return comments;
}

function generateStage2Comments() {
    const comments = [];

    if (!document.getElementById('photos')?.checked) {
        comments.push('нет фото объекта, фото панели, фото клавиатуры, фото СИМ');
    }
    if (!document.getElementById('form002')?.checked) {
        comments.push('нет формы 002');
    }
    if (!document.getElementById('avr')?.checked) {
        comments.push('нет акта выполненных работ с подписью клиента');
    }
    if (!document.getElementById('roads')?.checked) {
        comments.push('нет фото объекта на карте со схемой подъездных путей');
    }
    if (!document.getElementById('plan')?.checked) {
        comments.push('нет поэтажного плана');
    }
    if (!document.getElementById('electronic')?.checked) {
        comments.push('нет чек-листа в электронном виде');
    }

    return comments;
}

function updateStage1Comment() {
    const commentField = document.getElementById('stage1Comment');
    if (!commentField) return;

    const newAutoComments = generateStage1Comments();

    let fullComment = '';

    if (newAutoComments.length > 0) {
        fullComment = newAutoComments.join(', ');
    }

    if (manualCommentStage1) {
        if (fullComment) {
            fullComment += ', ' + manualCommentStage1;
        } else {
            fullComment = manualCommentStage1;
        }
    }

    commentField.value = fullComment;
    autoCommentsStage1 = newAutoComments;
}

function updateStage2Comment() {
    const commentField = document.getElementById('stage2Comment');
    if (!commentField) return;

    const newAutoComments = generateStage2Comments();

    let fullComment = '';

    if (newAutoComments.length > 0) {
        fullComment = newAutoComments.join(', ');
    }

    if (manualCommentStage2) {
        if (fullComment) {
            fullComment += ', ' + manualCommentStage2;
        } else {
            fullComment = manualCommentStage2;
        }
    }

    commentField.value = fullComment;
    autoCommentsStage2 = newAutoComments;
}

function handleManualComment(stage) {
    const commentField = document.getElementById(`stage${stage}Comment`);
    if (!commentField) return;

    const currentValue = commentField.value;

    if (stage === 1) {
        const autoText = autoCommentsStage1.join(', ');

        if (autoText && currentValue.startsWith(autoText)) {
            manualCommentStage1 = currentValue.substring(autoText.length).replace(/^, /, '');
        } else {
            manualCommentStage1 = currentValue;
        }
    } else {
        const autoText = autoCommentsStage2.join(', ');

        if (autoText && currentValue.startsWith(autoText)) {
            manualCommentStage2 = currentValue.substring(autoText.length).replace(/^, /, '');
        } else {
            manualCommentStage2 = currentValue;
        }
    }
}

function initializeComments(stage1Comment, stage2Comment) {
    autoCommentsStage1 = generateStage1Comments();
    autoCommentsStage2 = generateStage2Comments();

    const expectedAuto1 = autoCommentsStage1.join(', ');
    const expectedAuto2 = autoCommentsStage2.join(', ');

    if (stage1Comment) {
        if (expectedAuto1 && stage1Comment.startsWith(expectedAuto1)) {
            manualCommentStage1 = stage1Comment.substring(expectedAuto1.length).replace(/^, /, '');
        } else {
            manualCommentStage1 = stage1Comment;
            autoCommentsStage1 = [];
        }
    } else {
        manualCommentStage1 = '';
    }

    if (stage2Comment) {
        if (expectedAuto2 && stage2Comment.startsWith(expectedAuto2)) {
            manualCommentStage2 = stage2Comment.substring(expectedAuto2.length).replace(/^, /, '');
        } else {
            manualCommentStage2 = stage2Comment;
            autoCommentsStage2 = [];
        }
    } else {
        manualCommentStage2 = '';
    }

    commentsInitialized = true;
}

// ========== УДАЛЕНИЕ ЗАЯВКИ ==========
window.deleteApp = async function(id, event) {
    if (event) {
        event.stopPropagation();
    }

    if (!confirm('Удалить заявку?')) return;

    try {
        const response = await fetch(`/api/corp/applications/${id}`, {
            method: 'DELETE'
        });

        if (response.status === 204) {
            await loadApplications();
            showNotification('Заявка удалена');
        } else if (response.status === 404) {
            alert('Заявка не найдена');
        } else {
            const error = await response.text();
            console.error('Ошибка удаления:', error);
            alert('Ошибка удаления: ' + (error || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления: ' + error.message);
    }
};

// ========== СОЗДАНИЕ НОВОЙ ==========
window.openCreateModal = function() {
    releaseCurrentApplicationLock();

    currentApp = null;
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-plus-circle"></i> Новая заявка';

    document.getElementById('modalBody').innerHTML = getModalFormHtml(null, null);

    autoCommentsStage1 = [];
    autoCommentsStage2 = [];
    manualCommentStage1 = '';
    manualCommentStage2 = '';
    commentsInitialized = false;

    setupModalStyles();

    setTimeout(() => {
        updateStage1Comment();
        updateStage2Comment();
    }, 100);

    new bootstrap.Modal(document.getElementById('appModal')).show();
};

// ========== РЕДАКТИРОВАНИЕ ==========
window.openEditModal = async function(id) {
    releaseCurrentApplicationLock();

    try {
        const response = await fetch(`/api/corp/applications/${id}`);
        if (!response.ok) throw new Error('Ошибка загрузки');

        const app = await response.json();
        currentApp = app;

        document.getElementById('modalTitle').innerHTML = `<i class="bi bi-pencil"></i> Заявка ${app.applicationNumber}`;
        document.getElementById('modalBody').innerHTML = getModalFormHtml(app.applicationNumber, app.engineerName);

        // Подписываемся на все события для этой заявки
        subscribeToApplicationLocks(id);
        subscribeToApplicationViewers(id);
        subscribeToFieldChanges(id);
        subscribeToScrollSync(id);

        // Уведомляем о просмотре
        notifyApplicationView(id);

        if (stompClient && stompClient.connected) {
            console.log('Отправляем запрос на проверку блокировки для заявки:', id);
            stompClient.send("/app/edit.check", {}, JSON.stringify({
                applicationId: id
            }));

            setTimeout(() => {
                stompClient.send("/app/edit.start", {}, JSON.stringify({
                    applicationId: id,
                    stage: "all"
                }));
                currentlyLockedApplicationId = id;
            }, 500);
        }

        if (app.currentLockOwner && app.currentLockOwner !== currentUser) {
            document.getElementById('modalEditInfo').style.display = 'block';
            document.getElementById('modalEditUser').textContent = app.currentLockOwner;
            disableModalFields(true);

            const lockIndicator = document.getElementById('lockIndicator');
            const lockOwner = document.getElementById('lockOwner');
            if (lockIndicator && lockOwner) {
                lockIndicator.style.display = 'flex';
                lockOwner.textContent = app.currentLockOwner + ' редактирует эту заявку';
            }
        } else {
            document.getElementById('modalEditInfo').style.display = 'none';
            disableModalFields(false);
            const lockIndicator = document.getElementById('lockIndicator');
            if (lockIndicator) {
                lockIndicator.style.display = 'none';
            }
        }

        setTimeout(() => {
            fillModalData(app);
            setupModalStyles();
        }, 100);

        new bootstrap.Modal(document.getElementById('appModal')).show();

    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Ошибка загрузки заявки');
    }
};

// HTML форма
function getModalFormHtml(appNumber, engineerName) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedToday = `${day}.${month}.${year}`;

    return `
        <div class="row">
            <div class="col-md-6">
                <div class="bg-primary bg-opacity-10 p-3 rounded" style="border-left: 4px solid #0d6efd;">
                    <h6 class="mb-3">Этап 1</h6>

                    <div class="mb-2">
                        <label>Номер заявки *</label>
                        <input type="text" class="form-control" id="appNumber" value="${appNumber || ''}" placeholder="Введите номер заявки" required>
                    </div>

                    <div class="mb-2">
                        <label>Инженер *</label>
                        <input type="text" class="form-control" id="engineerName" value="${engineerName || ''}" placeholder="Введите ФИО инженера" required>
                    </div>

                    <div class="mb-2">
                        <label>Дата монтажа</label>
                        <input type="text" class="form-control" id="installDate" value="${formattedToday}"
                               placeholder="ДД.ММ.ГГГГ" onpaste="handleDatePaste(event)">
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="panelNumberAssigned">
                        <label class="form-check-label" for="panelNumberAssigned">Пультовой прописан</label>
                    </div>

                    <div class="mb-2">
                        <label>IMEI</label>
                        <input type="text" class="form-control" id="panelSerial" placeholder="Серийный номер/IMEI">
                    </div>

                    <div class="mb-2">
                        <input type="text" class="form-control" id="gsmLevel" placeholder="Уровень GSM">
                    </div>

                    <div class="mb-2">
                        <select class="form-control" id="sensorPhoto">
                            <option value="false">Фото уровня связи: Нет</option>
                            <option value="true">Да</option>
                            <option value="wired">Проводная</option>
                        </select>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="panicSignal" onchange="updateStage1Comment()">
                        <label class="form-check-label" for="panicSignal">КТС 120/122</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="csmSignal" onchange="updateStage1Comment()">
                        <label class="form-check-label" for="csmSignal">Сигналы КТС на ЦСМ</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="instruction">
                        <label class="form-check-label" for="instruction">Наклеена инструкция</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="arming" onchange="updateStage1Comment()">
                        <label class="form-check-label" for="arming">Пост/снятие</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="backup" onchange="updateStage1Comment()">
                        <label class="form-check-label" for="backup">Резервное питание</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="ceilings">
                        <label class="form-check-label" for="ceilings">Высокие потолки</label>
                    </div>

                    <div class="row">
                        <div class="col-6">
                            <label>Дата ОП1</label>
                            <input type="date" class="form-control" id="stage1Date" value="${formatDateForInput(new Date().toISOString())}">
                        </div>
                        <div class="col-6">
                            <label>Проверяющий</label>
                            <input type="text" class="form-control" id="stage1Inspector" value="${currentUser}">
                        </div>
                    </div>

                    <div class="mb-2 mt-2">
                        <label>Комментарий ОП1</label>
                        <textarea class="form-control" id="stage1Comment" rows="2" oninput="handleManualComment(1)"></textarea>
                        <button class="btn btn-sm btn-outline-secondary mt-1 w-100" onclick="copyToClipboard('stage1Comment', this)">
                            <i class="bi bi-clipboard"></i> Копировать в буфер обмена
                        </button>
                    </div>

                    <div class="mt-2">
                        <label>Статус ОП1:</label>
                        <div class="btn-group w-100" id="stage1StatusGroup">
                            <button type="button" class="btn btn-sm btn-outline-success" onclick="setStatus('stage1', 'OK', this)">OK</button>
                            <button type="button" class="btn btn-sm btn-outline-danger" onclick="setStatus('stage1', 'NOK', this)">NOK</button>
                        </div>
                        <input type="hidden" id="stage1Status">
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="bg-success bg-opacity-10 p-3 rounded" style="border-left: 4px solid #198754;">
                    <h6 class="mb-3">Этап 2</h6>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="rental">
                        <label class="form-check-label" for="rental">Аренда</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="sticker">
                        <label class="form-check-label" for="sticker">Наклейка</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="photos" onchange="updateStage2Comment()">
                        <label class="form-check-label" for="photos">Фото объекта, КП, КЛ, СИМ</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="form002" onchange="updateStage2Comment()">
                        <label class="form-check-label" for="form002">Форма 002</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="avr" onchange="updateStage2Comment()">
                        <label class="form-check-label" for="avr">АВР</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="defect">
                        <label class="form-check-label" for="defect">Деф.акт</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="roads" onchange="updateStage2Comment()">
                        <label class="form-check-label" for="roads">Подъездные пути</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="plan" onchange="updateStage2Comment()">
                        <label class="form-check-label" for="plan">План</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="fireAlarm">
                        <label class="form-check-label" for="fireAlarm">ПС</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="electronic" onchange="updateStage2Comment()">
                        <label class="form-check-label" for="electronic">Эл.чек-лист</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="issues">
                        <label class="form-check-label" for="issues">Неисправности после монтажа</label>
                    </div>

                    <div class="mb-2 form-check">
                        <input type="checkbox" class="form-check-input" id="incomplete">
                        <label class="form-check-label" for="incomplete">Неполная форма 002</label>
                    </div>

                    <div class="mb-2" id="rentalCommentBlock" style="display:none;">
                        <label>Комментарий аренды</label>
                        <input type="text" class="form-control" id="rentalComment" placeholder="Введите комментарий...">
                    </div>

                    <div class="mb-2" id="fireAlarmBlock" style="display:none;">
                        <select class="form-control" id="fireAlarmChecklist">
                            <option value="">Чек-лист ПС...</option>
                            <option value="YES">Да</option>
                            <option value="NO">Нет</option>
                            <option value="GOS_MONTAZH">Монтаж ГОС</option>
                        </select>
                    </div>

                    <div class="row mt-2">
                        <div class="col-6">
                            <label>Дата ОП2</label>
                            <input type="date" class="form-control" id="stage2Date" value="${formatDateForInput(new Date().toISOString())}">
                        </div>
                        <div class="col-6">
                            <label>Проверяющий</label>
                            <input type="text" class="form-control" id="stage2Inspector" value="${currentUser}">
                        </div>
                    </div>

                    <div class="mb-2 mt-2">
                        <label>Комментарий ОП2</label>
                        <textarea class="form-control" id="stage2Comment" rows="2" oninput="handleManualComment(2)"></textarea>
                        <button class="btn btn-sm btn-outline-secondary mt-1 w-100" onclick="copyToClipboard('stage2Comment', this)">
                            <i class="bi bi-clipboard"></i> Копировать в буфер обмена
                        </button>
                    </div>

                    <div class="mt-2">
                        <label>Статус ОП2:</label>
                        <div class="btn-group w-100" id="stage2StatusGroup">
                            <button type="button" class="btn btn-sm btn-outline-success" onclick="setStatus('stage2', 'OK', this)">OK</button>
                            <button type="button" class="btn btn-sm btn-outline-danger" onclick="setStatus('stage2', 'NOK', this)">NOK</button>
                        </div>
                        <input type="hidden" id="stage2Status">
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.handleDatePaste = function(event) {
    event.preventDefault();
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    const parsedDate = parsePastedDate(pastedText);
    event.target.value = parsedDate;
};

function setupModalStyles() {
    const rental = document.getElementById('rental');
    if (rental) {
        rental.addEventListener('change', function() {
            const block = document.getElementById('rentalCommentBlock');
            if (block) block.style.display = this.checked ? 'block' : 'none';
        });
    }

    const fireAlarm = document.getElementById('fireAlarm');
    if (fireAlarm) {
        fireAlarm.addEventListener('change', function() {
            const block = document.getElementById('fireAlarmBlock');
            if (block) block.style.display = this.checked ? 'block' : 'none';
        });
    }

    const stage1Checkboxes = ['panicSignal', 'csmSignal', 'arming', 'backup'];
    stage1Checkboxes.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) {
            cb.removeEventListener('change', updateStage1Comment);
            cb.addEventListener('change', function() {
                updateStage1Comment();
                // Отправляем изменение поля
                if (currentApp) {
                    notifyFieldChange(currentApp.id, id, cb.checked);
                }
            });
        }
    });

    const stage2Checkboxes = ['photos', 'form002', 'avr', 'roads', 'plan', 'electronic'];
    stage2Checkboxes.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) {
            cb.removeEventListener('change', updateStage2Comment);
            cb.addEventListener('change', function() {
                updateStage2Comment();
                // Отправляем изменение поля
                if (currentApp) {
                    notifyFieldChange(currentApp.id, id, cb.checked);
                }
            });
        }
    });

    // Добавляем слушатели для текстовых полей
    const textFields = ['appNumber', 'engineerName', 'panelSerial', 'gsmLevel', 'rentalComment', 'stage1Comment', 'stage2Comment'];
    textFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('input', function() {
                if (currentApp) {
                    notifyFieldChange(currentApp.id, id, field.value);
                }
            });
        }
    });
}

function fillModalData(app) {
    console.log('Заполнение данных:', app);

    commentsInitialized = false;

    setValue('appNumber', app.applicationNumber);
    setValue('engineerName', app.engineerName);

    if (app.installationDate) {
        setValue('installDate', formatDateForDisplay(app.installationDate));
    }

    setChecked('panelNumberAssigned', app.panelNumberAssigned);
    setValue('panelSerial', app.panelSerial);

    let stage1Comment = '';
    let stage2Comment = '';

    if (app.stageOne) {
        setValue('gsmLevel', app.stageOne.gsmLevel);
        setValue('sensorPhoto', app.stageOne.sensorConnectionPhoto || 'false');
        setChecked('panicSignal', app.stageOne.panicSignalType);
        setChecked('csmSignal', app.stageOne.csmPanicSignal);
        setChecked('instruction', app.stageOne.instructionSticker);
        setChecked('arming', app.stageOne.armingDisarming);
        setChecked('backup', app.stageOne.backupPower);
        setChecked('ceilings', app.stageOne.highCeilings);
        setValue('stage1Date', app.stageOne.checkDate);
        setValue('stage1Inspector', app.stageOne.inspector);

        stage1Comment = app.stageOne.comments || '';

        if (app.stageOne.status) {
            const button = document.querySelector(`#stage1StatusGroup .btn-${app.stageOne.status === 'OK' ? 'outline-success' : 'outline-danger'}`);
            if (button) setStatus('stage1', app.stageOne.status, button);
        }
    }

    if (app.stageTwo) {
        setChecked('rental', app.stageTwo.equipmentRental);

        if (app.stageTwo.equipmentRental) {
            const block = document.getElementById('rentalCommentBlock');
            if (block) block.style.display = 'block';
            setValue('rentalComment', app.stageTwo.rentalComment);
        }

        setChecked('sticker', app.stageTwo.stickersStandard);
        setChecked('photos', app.stageTwo.systemPhotos);
        setChecked('form002', app.stageTwo.form002Filled);
        setChecked('avr', app.stageTwo.acceptanceCertificate);
        setChecked('defect', app.stageTwo.defectAct);
        setChecked('roads', app.stageTwo.accessRoads);
        setChecked('plan', app.stageTwo.floorPlan);
        setChecked('fireAlarm', app.stageTwo.fireAlarm);
        setChecked('electronic', app.stageTwo.electronicChecklist);
        setChecked('issues', app.stageTwo.postInstallationIssues);
        setChecked('incomplete', app.stageTwo.incompleteForm002);

        if (app.stageTwo.fireAlarm) {
            const block = document.getElementById('fireAlarmBlock');
            if (block) block.style.display = 'block';
            setValue('fireAlarmChecklist', app.stageTwo.fireAlarmChecklist);
        }

        setValue('stage2Date', app.stageTwo.checkDate);
        setValue('stage2Inspector', app.stageTwo.inspector);

        stage2Comment = app.stageTwo.comments || '';

        if (app.stageTwo.status) {
            const button = document.querySelector(`#stage2StatusGroup .btn-${app.stageTwo.status === 'OK' ? 'outline-success' : 'outline-danger'}`);
            if (button) setStatus('stage2', app.stageTwo.status, button);
        }
    }

    initializeComments(stage1Comment, stage2Comment);

    setTimeout(() => {
        updateStage1Comment();
        updateStage2Comment();
    }, 100);
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

function setChecked(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = value === true;
}

window.setStatus = function(stage, value, btn) {
    if (!btn) return;

    const statusInput = document.getElementById(stage + 'Status');
    if (statusInput) statusInput.value = value;

    const group = btn.closest('.btn-group');
    if (!group) return;

    group.querySelectorAll('.btn').forEach(b => {
        b.classList.remove('btn-success', 'btn-danger');
        b.classList.add('btn-outline-success', 'btn-outline-danger');
    });

    btn.classList.remove('btn-outline-success', 'btn-outline-danger');
    btn.classList.add(value === 'OK' ? 'btn-success' : 'btn-danger');
};

window.copyToClipboard = function(elementId, buttonElement) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.value;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="bi bi-check"></i> Скопировано!';
        buttonElement.classList.add('btn-success');
        buttonElement.classList.remove('btn-outline-secondary');

        setTimeout(() => {
            buttonElement.innerHTML = originalText;
            buttonElement.classList.remove('btn-success');
            buttonElement.classList.add('btn-outline-secondary');
        }, 2000);
    }).catch(err => {
        console.error('Ошибка копирования:', err);
        alert('Не удалось скопировать текст');
    });
};

// Функция показа уведомлений
function showNotification(msg, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    notif.style.zIndex = 9999;
    notif.style.minWidth = '250px';
    notif.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notif.style.animation = 'slideIn 0.3s ease';
    notif.innerHTML = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

window.saveApplication = async function() {
    const appNumber = document.getElementById('appNumber')?.value;
    const engineerName = document.getElementById('engineerName')?.value;

    if (!appNumber || !engineerName) {
        alert('Заполните обязательные поля (Номер заявки и Инженер)');
        return;
    }

    let installDate = document.getElementById('installDate')?.value;
    installDate = formatDateForStorage(installDate);

    const rentalChecked = document.getElementById('rental')?.checked || false;
    const rentalComment = rentalChecked ? document.getElementById('rentalComment')?.value : 'не требуется';

    const data = {
        applicationNumber: appNumber,
        engineerName: engineerName,
        panelNumberAssigned: document.getElementById('panelNumberAssigned')?.checked || false,
        panelSerial: document.getElementById('panelSerial')?.value,
        installationDate: installDate,

        stageOne: {
            gsmLevel: document.getElementById('gsmLevel')?.value,
            sensorConnectionPhoto: document.getElementById('sensorPhoto')?.value || 'false',
            panicSignalType: document.getElementById('panicSignal')?.checked || false,
            csmPanicSignal: document.getElementById('csmSignal')?.checked || false,
            instructionSticker: document.getElementById('instruction')?.checked || false,
            armingDisarming: document.getElementById('arming')?.checked || false,
            backupPower: document.getElementById('backup')?.checked || false,
            highCeilings: document.getElementById('ceilings')?.checked || false,
            checkDate: document.getElementById('stage1Date')?.value,
            inspector: document.getElementById('stage1Inspector')?.value,
            comments: document.getElementById('stage1Comment')?.value,
            status: document.getElementById('stage1Status')?.value || null
        },

        stageTwo: {
            equipmentRental: rentalChecked,
            rentalComment: rentalComment,
            stickersStandard: document.getElementById('sticker')?.checked || false,
            systemPhotos: document.getElementById('photos')?.checked || false,
            form002Filled: document.getElementById('form002')?.checked || false,
            accessRoads: document.getElementById('roads')?.checked || false,
            floorPlan: document.getElementById('plan')?.checked || false,
            fireAlarm: document.getElementById('fireAlarm')?.checked || false,
            fireAlarmChecklist: document.getElementById('fireAlarmChecklist')?.value || null,
            acceptanceCertificate: document.getElementById('avr')?.checked || false,
            defectAct: document.getElementById('defect')?.checked || false,
            electronicChecklist: document.getElementById('electronic')?.checked || false,
            postInstallationIssues: document.getElementById('issues')?.checked || false,
            incompleteForm002: document.getElementById('incomplete')?.checked || false,
            checkDate: document.getElementById('stage2Date')?.value,
            inspector: document.getElementById('stage2Inspector')?.value,
            comments: document.getElementById('stage2Comment')?.value,
            status: document.getElementById('stage2Status')?.value || null
        }
    };

    try {
        let response;
        if (currentApp && currentApp.id) {
            response = await fetch(`/api/corp/applications/${currentApp.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/corp/applications', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            // Отправляем уведомление об обновлении через WebSocket
            if (stompClient && stompClient.connected && currentApp) {
                stompClient.send("/app/application.update", {}, JSON.stringify({
                    applicationId: currentApp.id,
                    data: data,
                    username: currentUser
                }));
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById('appModal'));
            if (modal) modal.hide();

            await loadApplications();
            showNotification(currentApp ? 'Заявка обновлена!' : 'Заявка создана!');
        } else {
            const error = await response.text();
            throw new Error(error);
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка сохранения: ' + error.message);
    }
};

// ========== ONLINE USERS ==========
function updateOnlineUsers(data) {
    console.log('Обновление онлайн пользователей:', data);
    const users = data.userInfo || {};
    const onlineCount = Object.keys(users).length;
    document.getElementById('onlineCount').textContent = onlineCount;

    const usersList = document.getElementById('usersList');
    if (usersList) {
        if (onlineCount > 0) {
            usersList.innerHTML = Object.values(users)
                .map(u => `<span class="user-avatar" title="${u.username} (последняя активность: ${new Date(u.lastSeen).toLocaleTimeString()})">
                    ${u.username.charAt(0).toUpperCase()}
                </span>`)
                .join('');
        } else {
            usersList.innerHTML = '<span class="text-muted">нет пользователей</span>';
        }
    }
}

function toggleTheme(isDark) {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('corpcheck_theme', theme);
}

function initTheme() {
    const savedTheme = localStorage.getItem('corpcheck_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeSwitch = document.getElementById('themeSwitch');
        if (themeSwitch) themeSwitch.checked = savedTheme === 'dark';
    }
}