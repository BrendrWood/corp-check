// 04-chat-core.js
console.log('chat-core.js загружен');

// Звуковые настройки
let notificationSound = null;
let soundEnabled = true;
let unreadCount = 0;
let chatVisible = false;

// Инициализация звукового оповещения
function initNotificationSound() {
    try {
        notificationSound = new Audio();
        notificationSound.src = '/sounds/notification.mp3';
        
        notificationSound.onerror = function() {
            console.log('Звуковой файл не найден, используем Web Audio API');
            createBeepSound();
        };
        
        notificationSound.load();
    } catch (e) {
        console.log('Ошибка инициализации звука:', e);
        createBeepSound();
    }
}

// Создание звука через Web Audio API
function createBeepSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioCtx = new AudioContext();
        
        notificationSound = {
            play: function() {
                if (!soundEnabled) return;
                
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.3;
                
                oscillator.start();
                gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
                oscillator.stop(audioCtx.currentTime + 0.5);
            }
        };
    } catch (e) {
        console.log('Не удалось создать звук:', e);
    }
}

// Функция воспроизведения звука
function playNotificationSound() {
    if (!soundEnabled) return;
    
    try {
        if (notificationSound) {
            const sound = notificationSound.cloneNode ? notificationSound.cloneNode() : notificationSound;
            sound.play().catch(e => console.log('Ошибка воспроизведения звука:', e));
        }
    } catch (e) {
        console.log('Ошибка воспроизведения звука:', e);
    }
}

// Функция включения/выключения звука
function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    if (soundToggleBtn) {
        if (soundEnabled) {
            soundToggleBtn.innerHTML = '<i class="bi bi-volume-up"></i>';
            soundToggleBtn.title = 'Выключить звук уведомлений';
        } else {
            soundToggleBtn.innerHTML = '<i class="bi bi-volume-mute"></i>';
            soundToggleBtn.title = 'Включить звук уведомлений';
        }
    }
    
    localStorage.setItem('chatSoundEnabled', soundEnabled);
    
    if (soundEnabled) {
        playNotificationSound();
    }
}

// Загрузка сохраненных настроек
function loadSoundSettings() {
    const saved = localStorage.getItem('chatSoundEnabled');
    if (saved !== null) {
        soundEnabled = saved === 'true';
    }
    
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    if (soundToggleBtn) {
        if (soundEnabled) {
            soundToggleBtn.innerHTML = '<i class="bi bi-volume-up"></i>';
            soundToggleBtn.title = 'Выключить звук уведомлений';
        } else {
            soundToggleBtn.innerHTML = '<i class="bi bi-volume-mute"></i>';
            soundToggleBtn.title = 'Включить звук уведомлений';
        }
    }
}

// Обновление счетчика непрочитанных
function updateUnreadBadge() {
    const badge = document.getElementById('unreadBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Сброс счетчика при открытии чата
function markChatAsRead() {
    unreadCount = 0;
    updateUnreadBadge();
}

// Добавление кнопки звука в чат
function addSoundControlToChat() {
    const chatHeader = document.getElementById('chatHeader');
    if (chatHeader && !document.getElementById('soundToggleBtn')) {
        const soundBtn = document.createElement('button');
        soundBtn.id = 'soundToggleBtn';
        soundBtn.className = 'btn btn-sm btn-outline-light ms-2';
        soundBtn.onclick = (e) => {
            e.stopPropagation();
            toggleSound();
        };
        soundBtn.title = soundEnabled ? 'Выключить звук уведомлений' : 'Включить звук уведомлений';
        soundBtn.innerHTML = soundEnabled ? '<i class="bi bi-volume-up"></i>' : '<i class="bi bi-volume-mute"></i>';
        
        const headerSpan = chatHeader.querySelector('span');
        if (headerSpan) {
            headerSpan.appendChild(soundBtn);
        } else {
            chatHeader.appendChild(soundBtn);
        }
    }
}

// Сохраняем оригинальный метод addMessage, если он существует
const originalAddMessage = App.chat.ui?.addMessage;

// Переопределяем addMessage для добавления звука и счетчика
if (App.chat.ui) {
    App.chat.ui.addMessage = function(username, message, timestamp) {
        // Проверяем, что это не наше сообщение
        const currentUser = document.querySelector('meta[name="username"]')?.content || '';
        const isOwnMessage = username === currentUser;
        
        // Если чат не виден и сообщение не от нас - увеличиваем счетчик
        if (!chatVisible && !isOwnMessage) {
            unreadCount++;
            updateUnreadBadge();
        }
        
        // Воспроизводим звук, если сообщение не от нас
        if (!isOwnMessage) {
            playNotificationSound();
        }
        
        // Вызываем оригинальный метод
        if (originalAddMessage) {
            originalAddMessage(username, message, timestamp);
        }
    };
}

// Сохраняем оригинальный toggleChat
const originalToggleChat = window.toggleChat;

// Переопределяем toggleChat для отслеживания видимости чата
window.toggleChat = function(event) {
    // Вызываем оригинальную функцию
    if (originalToggleChat) {
        originalToggleChat(event);
    }
    
    // Проверяем состояние чата после переключения
    setTimeout(() => {
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow && chatWindow.classList.contains('visible')) {
            chatVisible = true;
            markChatAsRead();
        } else {
            chatVisible = false;
        }
    }, 100);
};

App.chat.core = {
    updateMessagesHeight: function() {
        const chatWindow = document.getElementById('chatWindow');
        const chatMessages = document.getElementById('chatMessages');
        const chatHeader = document.querySelector('.chat-header');
        const chatFooter = document.querySelector('.chat-footer');

        if (chatWindow && chatMessages && chatHeader && chatFooter) {
            const windowHeight = chatWindow.clientHeight;
            const headerHeight = chatHeader.offsetHeight;
            const footerHeight = chatFooter.offsetHeight;
            const messagesHeight = windowHeight - headerHeight - footerHeight - 2;
            chatMessages.style.height = messagesHeight + 'px';
            chatMessages.style.maxHeight = messagesHeight + 'px';
        }
    },

    scrollToBottom: function() {
        const container = document.getElementById('chatMessages');
        if (container) {
            this.updateMessagesHeight();
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 10);
        }
    },

    loadHistory: function() {
        if (!App.state.stompClient?.connected) {
            console.log('WebSocket не подключен, ждем...');
            setTimeout(() => this.loadHistory(), 1000);
            return;
        }

        const subKey = 'chatHistory_' + App.state.currentUser;

        if (App.state.activeSubscriptions.has(subKey)) {
            const oldSub = App.state.activeSubscriptions.get(subKey);
            if (oldSub?.unsubscribe) oldSub.unsubscribe();
            App.state.activeSubscriptions.delete(subKey);
        }

        const subscription = App.state.stompClient.subscribe('/user/queue/chat.history', (history) => {
            try {
                const messages = JSON.parse(history.body);
                const container = document.getElementById('chatMessages');
                if (!container) return;

                container.innerHTML = '';
                if (!messages?.length) {
                    container.innerHTML = '<div class="text-center text-muted p-2">Нет сообщений</div>';
                    return;
                }

                const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);
                sortedMessages.forEach(msg => {
                    if (App.chat.ui?.addMessage) {
                        App.chat.ui.addMessage(msg.username, msg.message, msg.timestamp);
                    }
                });

                setTimeout(() => this.scrollToBottom(), 200);
            } catch (e) {
                console.error('Ошибка обработки истории чата:', e);
            }
        });

        App.state.activeSubscriptions.set(subKey, subscription);
        App.state.stompClient.send("/app/chat.history", {}, {});
    },

    sendMessage: function() {
        const input = document.getElementById('chatInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message || !App.state.stompClient) return;

        App.state.stompClient.send("/app/chat.send", {}, JSON.stringify({ message }));
        input.value = '';
    }
};

// Инициализация звука при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initNotificationSound();
    loadSoundSettings();
    addSoundControlToChat();
    
    // Проверяем начальное состояние чата
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) {
        chatVisible = chatWindow.classList.contains('visible');
    }
});

window.updateChatMessagesHeight = () => App.chat.core.updateMessagesHeight();
window.scrollChatToBottom = () => App.chat.core.scrollToBottom();
window.loadChatHistory = () => App.chat.core.loadHistory();
window.sendMessage = () => App.chat.core.sendMessage();
