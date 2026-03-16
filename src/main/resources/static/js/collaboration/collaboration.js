// 07-collaboration.js
console.log('collaboration.js загружен');

App.collab = {
    notifyView: function(applicationId) {
        if (!App.state.stompClient?.connected || !applicationId) return;
        App.state.stompClient.send("/app/application.view", {}, JSON.stringify({
            applicationId: applicationId,
            username: App.state.currentUser,
            timestamp: Date.now()
        }));
    },

    notifyLeave: function(applicationId) {
        if (!App.state.stompClient?.connected || !applicationId) return;
        App.state.stompClient.send("/app/application.leave", {}, JSON.stringify({
            applicationId: applicationId
        }));
    },

    updateViewersList: function(data) {
        const viewersContainer = document.getElementById('applicationViewers');
        if (!viewersContainer) return;

        const viewers = data.viewers || {};
        const viewerNames = Object.keys(viewers).filter(name =>
            name && name !== 'null' && name !== 'undefined' && name !== App.state.currentUser
        );

        if (viewerNames.length === 0) {
            viewersContainer.style.display = 'none';
            return;
        }

        viewersContainer.style.display = 'flex';
        viewersContainer.innerHTML = '';

        const icon = document.createElement('i');
        icon.className = 'bi bi-eye-fill me-1';
        icon.style.color = '#4361ee';
        viewersContainer.appendChild(icon);

        const text = document.createElement('span');
        text.className = 'me-1';
        text.textContent = 'Смотрят:';
        viewersContainer.appendChild(text);

        viewerNames.forEach(name => {
            const badge = document.createElement('span');
            badge.className = 'viewer-badge ms-1';
            badge.title = `Просматривает с ${new Date(viewers[name]).toLocaleTimeString()}`;
            badge.textContent = name;
            viewersContainer.appendChild(badge);
        });
    },

    notifyFieldChange: function(applicationId, field, value) {
        if (!App.state.stompClient?.connected || !applicationId || !App.state.currentApp) return;

        if (App.state.fieldChangeTimer) {
            clearTimeout(App.state.fieldChangeTimer);
        }

        App.state.fieldChangeTimer = setTimeout(() => {
            console.log('✏️ Отправляем изменение поля:', field, '=', value);
            App.state.stompClient.send("/app/field.change", {}, JSON.stringify({
                applicationId: applicationId,
                field: field,
                value: value,
                username: App.state.currentUser,
                timestamp: Date.now()
            }));
            App.state.fieldChangeTimer = null;
        }, 500);
    },

    updateFieldFromChange: function(change) {
        if (change.username === App.state.currentUser) return;
        if (!App.state.currentApp || App.state.currentApp.id !== change.applicationId) return;

        const field = document.getElementById(change.field);
        if (!field) return;

        if (field.type === 'checkbox') {
            field.checked = change.value === true || change.value === 'true';
        } else {
            field.value = change.value || '';
        }

        field.classList.add('field-highlight');
        setTimeout(() => field.classList.remove('field-highlight'), 1000);

        const commentRelatedFields = [...App.FIELDS.STAGE1_COMMENT, ...App.FIELDS.STAGE2_COMMENT];
        if (commentRelatedFields.includes(change.field)) {
            if (App.FIELDS.STAGE1_COMMENT.includes(change.field)) {
                if (App.comments?.updateStage1) App.comments.updateStage1();
            } else {
                if (App.comments?.updateStage2) App.comments.updateStage2();
            }
        }
    },

    subscribeToLocks: function(applicationId) {
        if (!App.state.stompClient?.connected) return;

        const subKey = 'lock_' + applicationId;

        if (App.state.activeSubscriptions.has(subKey)) {
            const oldSub = App.state.activeSubscriptions.get(subKey);
            if (oldSub?.unsubscribe) oldSub.unsubscribe();
            App.state.activeSubscriptions.delete(subKey);
        }

        const subscription = App.state.stompClient.subscribe('/topic/editing/' + applicationId, (lockUpdate) => {
            try {
                const data = JSON.parse(lockUpdate.body);
                App.locks.handleEditingStatus(data);
            } catch (e) {
                console.error('Ошибка парсинга сообщения блокировки:', e);
            }
        });

        App.state.activeSubscriptions.set(subKey, subscription);
    },

    subscribeToViewers: function(applicationId) {
        if (!App.state.stompClient?.connected) return;

        const subKey = 'viewers_' + applicationId;

        if (App.state.activeSubscriptions.has(subKey)) {
            const oldSub = App.state.activeSubscriptions.get(subKey);
            if (oldSub?.unsubscribe) oldSub.unsubscribe();
            App.state.activeSubscriptions.delete(subKey);
        }

        const subscription = App.state.stompClient.subscribe('/topic/application/' + applicationId + '/viewers', (viewers) => {
            try {
                const data = JSON.parse(viewers.body);
                this.updateViewersList(data);
            } catch (e) {
                console.error('Ошибка парсинга списка просматривающих:', e);
            }
        });

        App.state.activeSubscriptions.set(subKey, subscription);
    },

    subscribeToUpdates: function() {
        if (!App.state.stompClient?.connected) return;

        const subKey = 'application_updates';
        if (App.state.activeSubscriptions.has(subKey)) return;

        const subscription = App.state.stompClient.subscribe('/topic/application/updates', (update) => {
            try {
                const data = JSON.parse(update.body);
                if (App.data?.updateInTable) App.data.updateInTable(data);
            } catch (e) {
                console.error('Ошибка обработки обновления заявки:', e);
            }
        });

        App.state.activeSubscriptions.set(subKey, subscription);
    },

    subscribeToFieldChanges: function(applicationId) {
        if (!App.state.stompClient?.connected) return;

        const subKey = 'field_changes_' + applicationId;

        if (App.state.activeSubscriptions.has(subKey)) {
            const oldSub = App.state.activeSubscriptions.get(subKey);
            if (oldSub?.unsubscribe) oldSub.unsubscribe();
            App.state.activeSubscriptions.delete(subKey);
        }

        const subscription = App.state.stompClient.subscribe('/topic/application/' + applicationId + '/changes', (change) => {
            try {
                const data = JSON.parse(change.body);
                this.updateFieldFromChange(data);
            } catch (e) {
                console.error('Ошибка обработки изменения поля:', e);
            }
        });

        App.state.activeSubscriptions.set(subKey, subscription);
    },

    subscribeToScrollSync: function(applicationId) {
        if (!App.state.stompClient?.connected) return;

        const subKey = 'scroll_' + applicationId;

        if (App.state.activeSubscriptions.has(subKey)) {
            const oldSub = App.state.activeSubscriptions.get(subKey);
            if (oldSub?.unsubscribe) oldSub.unsubscribe();
            App.state.activeSubscriptions.delete(subKey);
        }

        const subscription = App.state.stompClient.subscribe('/topic/application/' + applicationId + '/scroll', (scroll) => {
            try {
                const data = JSON.parse(scroll.body);
                if (App.state.followMode && data.username !== App.state.currentUser) {
                    const modalBody = document.querySelector('.modal-body');
                    if (modalBody) modalBody.scrollTop = data.position;
                }
            } catch (e) {
                console.error('Ошибка синхронизации прокрутки:', e);
            }
        });

        App.state.activeSubscriptions.set(subKey, subscription);
    }
};

window.notifyApplicationView = (id) => App.collab.notifyView(id);
window.notifyApplicationLeave = (id) => App.collab.notifyLeave(id);
window.updateViewersList = (data) => App.collab.updateViewersList(data);
window.notifyFieldChange = (id, field, value) => App.collab.notifyFieldChange(id, field, value);
window.updateFieldFromChange = (change) => App.collab.updateFieldFromChange(change);
window.subscribeToApplicationLocks = (id) => App.collab.subscribeToLocks(id);
window.subscribeToApplicationViewers = (id) => App.collab.subscribeToViewers(id);
window.subscribeToApplicationUpdates = () => App.collab.subscribeToUpdates();
window.subscribeToFieldChanges = (id) => App.collab.subscribeToFieldChanges(id);
window.subscribeToScrollSync = (id) => App.collab.subscribeToScrollSync(id);