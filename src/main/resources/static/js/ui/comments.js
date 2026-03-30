// 14-comments.js
console.log('comments.js загружен');

App.comments = {
    // Флаг, указывающий, что идет загрузка заявки (чтобы не запускать автообновление)
    isLoading: false,
    
    // Функция обновления комментария этапа 1
    updateStage1: function() {
        // Если идет загрузка заявки - не обновляем комментарий
        if (App.comments.isLoading) return;
        
        // Проверяем, инициализированы ли комментарии
        if (!App.state.commentsInitialized) return;
        
        const autoComments = [];
        
        // Собираем автоматические комментарии для этапа 1
        // Комментарий добавляется, если чекбокс НЕ проставлен
        if (document.getElementById('panicSignal')?.checked === false) {
            autoComments.push('нет сигнала КТС 120/122');
        }
        if (document.getElementById('csmSignal')?.checked === false) {
            autoComments.push('нет сигналов КТС на ЦСМ');
        }
        if (document.getElementById('arming')?.checked === false) {
            autoComments.push('не работает пост/снятие');
        }
        if (document.getElementById('backup')?.checked === false) {
            autoComments.push('нет резервного питания');
        }
        
        // Сохраняем автоматические комментарии в state
        App.state.autoCommentsStage1 = autoComments;
        
        // Получаем текущий ручной комментарий (то, что пользователь ввел сам)
        let manualComment = App.state.manualCommentStage1 || '';
        
        // Формируем финальный комментарий
        let finalComment = manualComment;
        
        // Добавляем автоматические комментарии, если они есть
        if (autoComments.length > 0) {
            const autoText = autoComments.join('; ');
            
            // ПРОВЕРКА: добавляем только если текст еще не содержится в комментарии
            if (!App.comments.hasTextInComment(finalComment, autoText)) {
                if (finalComment && finalComment.trim()) {
                    finalComment = finalComment + '; ' + autoText;
                } else {
                    finalComment = autoText;
                }
            }
        }
        
        // Обновляем поле комментария, только если значение изменилось
        const commentField = document.getElementById('stage1Comment');
        if (commentField && commentField.value !== finalComment) {
            commentField.value = finalComment;
            // Сохраняем обновленное значение в ручной комментарий
            App.state.manualCommentStage1 = finalComment;
        }
    },
    
    // Функция обновления комментария этапа 2
    updateStage2: function() {
        // Если идет загрузка заявки - не обновляем комментарий
        if (App.comments.isLoading) return;
        
        // Проверяем, инициализированы ли комментарии
        if (!App.state.commentsInitialized) return;
        
        const autoComments = [];
        
        // Собираем автоматические комментарии для этапа 2
        // Комментарий добавляется, если чекбокс НЕ проставлен
        if (document.getElementById('photos')?.checked === false) {
            autoComments.push('нет фото объекта на карте со схемой подъездных путей с указанием входов');
        }
        if (document.getElementById('form002')?.checked === false) {
            autoComments.push('нет формы 002');
        }
        if (document.getElementById('plan')?.checked === false) {
            autoComments.push('нет поэтажного плана');
        }
        if (document.getElementById('roads')?.checked === false) {
            autoComments.push('нет подъездных путей');
        }
        if (document.getElementById('avr')?.checked === false) {
            autoComments.push('нет акта выполненных работ');
        }
        if (document.getElementById('electronic')?.checked === false) {
            autoComments.push('нет электронного чек-листа');
        }
        if (document.getElementById('defect')?.checked === false) {
            autoComments.push('нет дефектного акта');
        }
        
        // Сохраняем автоматические комментарии в state
        App.state.autoCommentsStage2 = autoComments;
        
        // Получаем текущий ручной комментарий
        let manualComment = App.state.manualCommentStage2 || '';
        
        // Формируем финальный комментарий
        let finalComment = manualComment;
        
        // Добавляем автоматические комментарии, если они есть
        if (autoComments.length > 0) {
            const autoText = autoComments.join('; ');
            
            // ПРОВЕРКА: добавляем только если текст еще не содержится в комментарии
            if (!App.comments.hasTextInComment(finalComment, autoText)) {
                if (finalComment && finalComment.trim()) {
                    finalComment = finalComment + '; ' + autoText;
                } else {
                    finalComment = autoText;
                }
            }
        }
        
        // Обновляем поле комментария, только если значение изменилось
        const commentField = document.getElementById('stage2Comment');
        if (commentField && commentField.value !== finalComment) {
            commentField.value = finalComment;
            // Сохраняем обновленное значение в ручной комментарий
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
            
            // После загрузки проверяем, нужно ли обновить комментарии
            // (на случай, если чекбоксы уже были установлены)
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
        
        // Разбиваем поисковый текст на отдельные фразы (по точке с запятой)
        const searchParts = searchText.split(';').map(p => p.trim());
        
        // Проверяем каждую часть отдельно
        for (const part of searchParts) {
            if (part && commentText.includes(part)) {
                return true;
            }
        }
        
        // Проверяем первые 20 символов для длинных текстов
        const shortSearch = searchText.substring(0, 20);
        if (shortSearch && commentText.includes(shortSearch)) return true;
        
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
