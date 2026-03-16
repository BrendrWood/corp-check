// 05-chat-ui.js
console.log('chat-ui.js загружен');

App.chat.ui = {
    toggle: function(event) {
        if (event) event.stopPropagation();
        App.state.chatVisible = !App.state.chatVisible;

        const chatWindow = document.getElementById('chatWindow');
        const chatToggle = document.getElementById('chatToggle');

        if (!chatWindow || !chatToggle) return;

        if (App.state.chatVisible) {
            chatWindow.style.display = 'block';
            chatToggle.innerHTML = '<i class="bi bi-chat-dots-fill"></i>';

            App.state.unreadMessages = 0;
            const unreadBadge = document.getElementById('unreadBadge');
            if (unreadBadge) unreadBadge.style.display = 'none';

            setTimeout(() => {
                App.chat.core.updateMessagesHeight();
                App.chat.core.loadHistory();
            }, 100);
        } else {
            chatWindow.style.display = 'none';
            chatToggle.innerHTML = '<i class="bi bi-chat-dots"></i>';
        }
    },

    addMessage: function(username, message, timestamp) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const isOwn = username === App.state.currentUser;
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
                    <span class="fw-bold">${isOwn ? 'Вы' : App.utils.escapeHtml(username)}</span>
                    <span class="small opacity-75">${time}</span>
                </small>
                <div class="mt-0" style="line-height: 1.3;">${App.utils.escapeHtml(message || '')}</div>
            </div>
        `;

        container.appendChild(msgDiv);
        App.chat.core.scrollToBottom();
    },

    displayMessage: function(data) {
        console.log('💬 Получено сообщение:', data);
        this.addMessage(data.username, data.data?.message, data.timestamp);

        if (!App.state.chatVisible && data.username !== App.state.currentUser) {
            App.state.unreadMessages++;
            const unreadBadge = document.getElementById('unreadBadge');
            if (unreadBadge) {
                unreadBadge.style.display = 'inline';
                unreadBadge.textContent = App.state.unreadMessages;
            }
        }
    },

    initScrollListener: function() {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        container.addEventListener('scroll', function() {
            const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
            App.state.shouldAutoScrollChat = isScrolledToBottom;
        });
    },

    scrollToBottomForce: function() {
        App.state.shouldAutoScrollChat = true;
        const container = document.getElementById('chatMessages');
        if (container) container.scrollTop = container.scrollHeight;
    }
};

window.toggleChat = (event) => App.chat.ui.toggle(event);
window.addMessageToChat = (username, message, timestamp) => App.chat.ui.addMessage(username, message, timestamp);
window.displayMessage = (data) => App.chat.ui.displayMessage(data);
window.initChatScrollListener = () => App.chat.ui.initScrollListener();
window.scrollChatToBottomForce = () => App.chat.ui.scrollToBottomForce();