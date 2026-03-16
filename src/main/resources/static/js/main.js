// 11-main.js
console.log('main.js загружен');

App.ui = {
    applyFilter: function(filter) {
        App.state.currentFilter = filter;

        document.querySelectorAll('.filter-chips .chip').forEach(chip => {
            chip.classList.remove('active');
        });

        const activeChip = document.querySelector(`.filter-chips .chip[onclick*="'${filter}'"]`);
        if (activeChip) activeChip.classList.add('active');

        let filtered = [];
        switch(filter) {
            case 'all':
                filtered = App.state.allApplications;
                break;
            case 'stage1':
                filtered = App.state.allApplications.filter(a =>
                    !a.stage1Status || a.stage1Status === 'NOK'
                );
                break;
            case 'stage2':
                filtered = App.state.allApplications.filter(a =>
                    a.stage1Status === 'OK' && (!a.stage2Status || a.stage2Status === 'NOK')
                );
                break;
            case 'problems':
                filtered = App.state.allApplications.filter(a =>
                    a.stage1Status === 'NOK' || a.stage2Status === 'NOK'
                );
                break;
            case 'completed':
                filtered = App.state.allApplications.filter(a =>
                    a.stage1Status === 'OK' && a.stage2Status === 'OK'
                );
                break;
            default:
                filtered = App.state.allApplications;
        }

        App.state.applications = filtered;
        this.renderTable();

        const countEl = document.getElementById('appsCount');
        if (countEl) countEl.textContent = App.state.applications.length;

        setTimeout(() => this.scrollToLast(), 300);
    },

    renderTable: function() {
        const tbody = document.getElementById('appsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        App.state.applications.forEach((app, index) => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.onclick = () => App.modal.openEdit(app.id);

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${App.utils.escapeHtml(app.applicationNumber || '')}</strong></td>
                <td>${App.utils.escapeHtml(app.engineerName || '')}</td>
                <td>${App.utils.formatDateForDisplay(app.installationDate)}</td>
                <td>${App.utils.formatStatus(app.stage1Status)}</td>
                <td>${App.utils.formatStatus(app.stage2Status)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); App.data.delete(${app.id}, event)">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    scrollToLast: function() {
        const container = document.querySelector('.card-body div[style*="overflow-y"]');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    },

    updateOnlineUsers: function(data) {
        const users = data.userInfo || {};
        const onlineCount = Object.keys(users).length;

        const countEl = document.getElementById('onlineCount');
        if (countEl) countEl.textContent = onlineCount;

        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        if (onlineCount > 0) {
            usersList.innerHTML = Object.values(users)
                .map(u => `<span class="user-avatar" title="${u.username} (последняя активность: ${new Date(u.lastSeen).toLocaleTimeString()})">
                    ${u.username.charAt(0).toUpperCase()}
                </span>`)
                .join('');
        } else {
            usersList.innerHTML = '<span class="text-muted">нет пользователей</span>';
        }
    },

    toggleTheme: function(isDark) {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('corpcheck_theme', theme);
    },

    initTheme: function() {
        const savedTheme = localStorage.getItem('corpcheck_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            const themeSwitch = document.getElementById('themeSwitch');
            if (themeSwitch) themeSwitch.checked = savedTheme === 'dark';
        }
    },

    connectWebSocket: function() {
        const socket = new SockJS('/ws');
        App.state.stompClient = Stomp.over(socket);
        App.state.stompClient.debug = null;

        App.state.stompClient.connect({}, () => {
            console.log('✅ WebSocket подключен');

            App.state.stompClient.subscribe('/topic/applications', () => App.data.loadAll());
            App.state.stompClient.subscribe('/topic/users', (users) => {
                this.updateOnlineUsers(JSON.parse(users.body));
            });
            App.state.stompClient.subscribe('/topic/chat', (chatMessage) => {
                App.chat.ui.displayMessage(JSON.parse(chatMessage.body));
            });

            App.collab.subscribeToUpdates();

            App.state.stompClient.subscribe('/user/queue/reply', (message) => {
                const data = JSON.parse(message.body);
                if (data.type === 'LOCK') {
                    if (data.action === 'CHECK' && data.lockOwner && data.lockOwner !== App.state.currentUser) {
                        if (App.state.currentApp?.id === data.applicationId) {
                            App.locks.handleEditingStatus(data);
                        }
                    } else if (data.action === 'LOCK_FAILED') {
                        alert(data.data?.message || 'Не удалось заблокировать заявку');
                    }
                }
            });

            App.state.stompClient.send("/app/user.connect", {}, JSON.stringify({
                username: App.state.currentUser
            }));

            setTimeout(() => App.chat.core.loadHistory(), 1000);

        }, (error) => {
            console.error('❌ Ошибка WebSocket:', error);
            setTimeout(() => this.connectWebSocket(), 5000);
        });
    }
};

// Глобальные функции
window.applyFilter = (filter) => App.ui.applyFilter(filter);
window.filterApps = (filter) => App.ui.applyFilter(filter);
window.renderTable = () => App.ui.renderTable();
window.scrollToLastApplication = () => App.ui.scrollToLast();
window.updateOnlineUsers = (data) => App.ui.updateOnlineUsers(data);
window.toggleTheme = (isDark) => App.ui.toggleTheme(isDark);
window.initTheme = () => App.ui.initTheme();
window.connectWebSocket = () => App.ui.connectWebSocket();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация приложения...');

    App.chat.resize.initResizable();
    App.chat.resize.initDraggable();
    App.chat.ui.initScrollListener();

    App.ui.connectWebSocket();
    App.data.loadAll();
    App.ui.initTheme();

    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', (e) => App.ui.toggleTheme(e.target.checked));
    }

    document.addEventListener('click', (event) => {
        const chatWindow = document.getElementById('chatWindow');
        const chatToggle = document.getElementById('chatToggle');
        const onlineUsers = document.getElementById('onlineUsers');

        if (App.state.chatVisible && chatWindow && chatToggle && onlineUsers &&
            !chatWindow.contains(event.target) &&
            !chatToggle.contains(event.target) &&
            !onlineUsers.contains(event.target)) {
            App.chat.ui.toggle();
        }
    });

    const appModal = document.getElementById('appModal');
    if (appModal) {
        appModal.addEventListener('hidden.bs.modal', () => {
            if (App.state.currentApp) {
                App.collab.notifyLeave(App.state.currentApp.id);
            }
            App.locks.releaseCurrentLock();
            App.state.currentApp = null;
        });
    }
});