// 14-comments.js
console.log('comments.js загружен');

App.comments = {
    // Флаг, указывающий, что идет загрузка заявки (чтобы не запускать автообновление)
    isLoading: false,
    
    // Функция удаления конкретного текста из комментария
    removeTextFromComment: function(comment, textToRemove) {
        if (!comment) return '';
        
        // Разбиваем комментарий на части по точке с запятой
        let parts = comment.split(';').map(p => p.trim()).filter(p => p);
        
        // Удаляем часть, которая содержит искомый текст
        parts = parts.filter(part => !part.includes(textToRemove));
        
        // Собираем обратно
        return parts.join('; ');
    },
    
    // Функция обновления комментария этапа 1
    updateStage1: function() {
        // Если идет загрузка заявки - не обновляем комментарий
        if (App.comments.isLoading) return;
        
        // Проверяем, инициализированы ли комментарии
        if (!App.state.commentsInitialized) return;
        
        // Получаем текущий комментарий
        let currentComment = App.state.manualCommentStage1 || '';
        const commentField = document.getElementById('stage1Comment');
        
        // Маппинг чекбоксов на текст, который нужно добавить/удалить
        const checkboxMapping = [
            { id: 'panicSignal', text: 'нет сигнала КТС 120/122' },
            { id: 'csmSignal', text: 'нет сигналов КТС на ЦСМ' },
            { id: 'arming', text: 'не работает пост/снятие' },
            { id: 'backup', text: 'нет резервного питания' }
        ];
        
        let finalComment = currentComment;
        let hasChanges = false;
        
        // Проходим по всем чекбоксам
        for (const mapping of checkboxMapping) {
            const checkbox = document.getElementById(mapping.id);
            if (!checkbox) continue;
            
            if (checkbox.checked === false) {
                // Если чекбокс НЕ проставлен - добавляем текст
                if (!App.comments.hasTextInComment(finalComment, mapping.text)) {
                    if (finalComment && finalComment.trim()) {
                        finalComment = finalComment + '; ' + mapping.text;
                    } else {
                        finalComment = mapping.text;
                    }
                    hasChanges = true;
                }
            } else {
                // Если чекбокс ПРОСТАВЛЕН - удаляем текст
                if (App.comments.hasTextInComment(finalComment, mapping.text)) {
                    finalComment = App.comments.removeTextFromComment(finalComment, mapping.text);
                    hasChanges = true;
                }
            }
        }
        
        // Сохраняем автоматические комментарии в state
        App.state.autoCommentsStage1 = checkboxMapping
            .filter(m => document.getElementById(m.id)?.checked === false)
            .map(m => m.text);
        
        // Обновляем поле комментария, если были изменения
        if (hasChanges && commentField && commentField.value !== finalComment) {
            commentField.value = finalComment;
            App.state.manualCommentStage1 = finalComment;
        }
    },
    
    // Функция обновления комментария этапа 2
    updateStage2: function() {
        // Если идет загрузка заявки - не обновляем комментарий
        if (App.comments.isLoading) return;
        
        // Проверяем, инициализированы ли комментарии
        if (!App.state.commentsInitialized) return;
        
        // Получаем текущий комментарий
        let currentComment = App.state.manualCommentStage2 || '';
        const commentField = document.getElementById('stage2Comment');
        
        // Маппинг чекбоксов на текст, который нужно добавить/удалить
        // defect (Деф.акт) - УБРАН из автозаполнения
        const checkboxMapping = [
            { id: 'photos', text: 'нет фото объекта на карте со схемой подъездных путей с указанием входов' },
            { id: 'form002', text: 'нет формы 002' },
            { id: 'plan', text: 'нет поэтажного плана' },
            { id: 'roads', text: 'нет подъездных путей' },
            { id: 'avr', text: 'нет акта выполненных работ' },
            { id: 'electronic', text: 'нет электронного чек-листа' }
            // defect (Деф.акт) - НЕ участвует в автозаполнении
        ];
        
        let finalComment = currentComment;
        let hasChanges = false;
        
        // Проходим по всем чекбоксам
        for (const mapping of checkboxMapping) {
            const checkbox = document.getElementById(mapping.id);
            if (!checkbox) continue;
            
            if (checkbox.checked === false) {
                // Если чекбокс НЕ проставлен - добавляем текст
                if (!App.comments.hasTextInComment(finalComment, mapping.text)) {
                    if (finalComment && finalComment.trim()) {
                        finalComment = finalComment + '; ' + mapping.text;
                    } else {
                        finalComment = mapping.text;
                    }
                    hasChanges = true;
                }
            } else {
                // Если чекбокс ПРОСТАВЛЕН - удаляем текст
                if (App.comments.hasTextInComment(finalComment, mapping.text)) {
                    finalComment = App.comments.removeTextFromComment(finalComment, mapping.text);
                    hasChanges = true;
                }
            }
        }
        
        // Сохраняем автоматические комментарии в state
        App.state.autoCommentsStage2 = checkboxMapping
            .filter(m => document.getElementById(m.id)?.checked === false)
            .map(m => m.text);
        
        // Обновляем поле комментария, если были изменения
        if (hasChanges && commentField && commentField.value !== finalComment) {
            commentField.value = finalComment;
            App.state.manualCommentStage2 = finalComment;
        }
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
        
        // Выключаем режим загрузки после того, как поля заполнены
        setTimeout(() => {
            App.comments.isLoading = false;
            
            // После загрузки синхронизируем комментарии с текущим состоянием чекбоксов
            if (App.comments.updateStage1) App.comments.updateStage1();
            if (App.comments.updateStage2) App.comments.updateStage2();
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
    
    // Функция проверки, есть ли уже текст в комментарии
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
    
    // Функция для полной синхронизации комментариев с чекбоксами
    syncWithCheckboxes: function() {
        App.comments.isLoading = false;
        App.comments.updateStage1();
        App.comments.updateStage2();
    }
};

// Глобальные функции для доступа из других скриптов
window.updateStage1Comment = () => App.comments.updateStage1();
window.updateStage2Comment = () => App.comments.updateStage2();
window.handleManualComment = (stage) => App.comments.handleManualComment(stage);
window.resetComments = () => App.comments.reset();
window.syncCommentsWithCheckboxes = () => App.comments.syncWithCheckboxes();
