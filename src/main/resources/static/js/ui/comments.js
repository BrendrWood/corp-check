// 14-comments.js
console.log('comments.js загружен');

App.comments = {
    // Флаг, указывающий, что идет загрузка заявки (чтобы не запускать автообновление)
    isLoading: false,
    
    // Функция удаления конкретного текста из комментария (оставлена на случай использования)
    removeTextFromComment: function(comment, textToRemove) {
        if (!comment) return '';
        
        // Разбиваем комментарий на части по точке с запятой
        let parts = comment.split(';').map(p => p.trim()).filter(p => p);
        
        // Удаляем часть, которая содержит искомый текст
        parts = parts.filter(part => !part.includes(textToRemove));
        
        // Собираем обратно
        return parts.join('; ');
    },
    
    // Функция обновления комментария этапа 1 - ОТКЛЮЧЕНА (автозаполнение только по кнопке)
    updateStage1: function() {
        // Автозаполнение отключено - ничего не делаем
        return;
    },
    
    // Функция обновления комментария этапа 2 - ОТКЛЮЧЕНА (автозаполнение только по кнопке)
    updateStage2: function() {
        // Автозаполнение отключено - ничего не делаем
        return;
    },
    
    // Функция инициализации комментариев при загрузке заявки
    initialize: function(stage1Comment, stage2Comment) {
        // Включаем режим загрузки, чтобы не запускать автообновление
        App.comments.isLoading = true;
        
        // Устанавливаем ручные комментарии из загруженной заявки
        App.state.manualCommentStage1 = stage1Comment || '';
        App.state.manualCommentStage2 = stage2Comment || '';
        
        // Сбрасываем автоматические комментарии
        App.state.autoCommentsStage1 = [];
        App.state.autoCommentsStage2 = [];
        
        // Заполняем поля комментариев
        const stage1Field = document.getElementById('stage1Comment');
        const stage2Field = document.getElementById('stage2Comment');
        
        if (stage1Field) {
            stage1Field.value = stage1Comment || '';
        }
        if (stage2Field) {
            stage2Field.value = stage2Comment || '';
        }
        
        // Помечаем, что комментарии инициализированы
        App.state.commentsInitialized = true;
        
        // Выключаем режим загрузки
        setTimeout(() => {
            App.comments.isLoading = false;
        }, 50);
    },
    
    // Функция для ручного редактирования комментария (вызывается при вводе пользователя)
    handleManualComment: function(stage) {
        if (!App.state.commentsInitialized) return;
        
        const commentField = document.getElementById(stage === 1 ? 'stage1Comment' : 'stage2Comment');
        if (!commentField) return;
        
        const manualText = commentField.value;
        
        // Сохраняем ручной комментарий
        if (stage === 1) {
            App.state.manualCommentStage1 = manualText;
        } else {
            App.state.manualCommentStage2 = manualText;
        }
    },
    
    // Функция очистки всех комментариев (при создании новой заявки)
    reset: function() {
        App.comments.isLoading = false;
        App.state.manualCommentStage1 = '';
        App.state.manualCommentStage2 = '';
        App.state.autoCommentsStage1 = [];
        App.state.autoCommentsStage2 = [];
        App.state.commentsInitialized = true;
        
        const stage1Field = document.getElementById('stage1Comment');
        const stage2Field = document.getElementById('stage2Comment');
        
        if (stage1Field) stage1Field.value = '';
        if (stage2Field) stage2Field.value = '';
    },
    
    // Функция проверки, есть ли уже текст в комментарии (используется кнопкой автозаполнения)
    hasTextInComment: function(commentText, searchText) {
        if (!commentText || !searchText) return false;
        
        // Проверяем точное совпадение
        if (commentText.includes(searchText)) return true;
        
        // Разбиваем комментарий на части по точке с запятой
        const commentParts = commentText.split(';').map(p => p.trim());
        
        // Проверяем каждую часть отдельно
        for (const part of commentParts) {
            if (part === searchText) return true;
            if (part.includes(searchText)) return true;
        }
        
        return false;
    },
    
    // Функция для полной синхронизации комментариев с чекбоксами (отключена)
    syncWithCheckboxes: function() {
        // Автозаполнение отключено - ничего не делаем
        return;
    }
};

// Глобальные функции для доступа из других скриптов
window.updateStage1Comment = () => App.comments.updateStage1();
window.updateStage2Comment = () => App.comments.updateStage2();
window.handleManualComment = (stage) => App.comments.handleManualComment(stage);
window.resetComments = () => App.comments.reset();
window.syncCommentsWithCheckboxes = () => App.comments.syncWithCheckboxes();
