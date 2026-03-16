 // 04-chat-core.js
 console.log('chat-core.js загружен');

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

 window.updateChatMessagesHeight = () => App.chat.core.updateMessagesHeight();
 window.scrollChatToBottom = () => App.chat.core.scrollToBottom();
 window.loadChatHistory = () => App.chat.core.loadHistory();
 window.sendMessage = () => App.chat.core.sendMessage();