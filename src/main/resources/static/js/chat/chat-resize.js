// 03-chat-resize.js
console.log('chat-resize.js загружен');

App.chat = App.chat || {};

App.chat.resize = {
    initResizable: function() {
        const chatWindow = document.getElementById('chatWindow');
        const resizeHandle = document.getElementById('resizeHandle');
        if (!chatWindow || !resizeHandle) return;

        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(chatWindow).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(chatWindow).height, 10);

            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });

        const resize = (e) => {
            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);
            const newHeight = Math.min(Math.max(300, height), 400);
            chatWindow.style.width = Math.max(250, width) + 'px';
            chatWindow.style.height = newHeight + 'px';
            if (App.chat.core?.updateMessagesHeight) {
                App.chat.core.updateMessagesHeight();
            }
        };

        const stopResize = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            setTimeout(() => {
                if (App.chat.core?.updateMessagesHeight) {
                    App.chat.core.updateMessagesHeight();
                    App.chat.core.scrollToBottom();
                }
            }, 50);
        };
    },

    initDraggable: function() {
        const chatWindow = document.getElementById('chatWindow');
        const chatHeader = document.getElementById('chatHeader');
        if (!chatWindow || !chatHeader) return;

        let offsetX, offsetY;

        chatHeader.addEventListener('mousedown', function(e) {
            e.preventDefault();
            offsetX = e.clientX - chatWindow.getBoundingClientRect().left;
            offsetY = e.clientY - chatWindow.getBoundingClientRect().top;

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        });

        const drag = (e) => {
            chatWindow.style.left = (e.clientX - offsetX) + 'px';
            chatWindow.style.top = (e.clientY - offsetY) + 'px';
            chatWindow.style.transform = 'none';
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        };
    }
};

window.initResizable = () => App.chat.resize.initResizable();
window.initDraggable = () => App.chat.resize.initDraggable();