// 09-comments.js
console.log('comments.js загружен');

App.comments = {
    generateStage1: function() {
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
    },

    generateStage2: function() {
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
    },

    updateStage1: function() {
        const commentField = document.getElementById('stage1Comment');
        if (!commentField) return;

        const newAutoComments = this.generateStage1();
        let fullComment = newAutoComments.join(', ');

        if (App.state.manualCommentStage1) {
            fullComment = fullComment ?
                fullComment + ', ' + App.state.manualCommentStage1 :
                App.state.manualCommentStage1;
        }

        commentField.value = fullComment;
        App.state.autoCommentsStage1 = newAutoComments;
    },

    updateStage2: function() {
        const commentField = document.getElementById('stage2Comment');
        if (!commentField) return;

        const newAutoComments = this.generateStage2();
        let fullComment = newAutoComments.join(', ');

        if (App.state.manualCommentStage2) {
            fullComment = fullComment ?
                fullComment + ', ' + App.state.manualCommentStage2 :
                App.state.manualCommentStage2;
        }

        commentField.value = fullComment;
        App.state.autoCommentsStage2 = newAutoComments;
    },

    handleManual: function(stage) {
        const commentField = document.getElementById(`stage${stage}Comment`);
        if (!commentField) return;

        const currentValue = commentField.value;

        if (stage === 1) {
            const autoText = App.state.autoCommentsStage1.join(', ');
            if (autoText && currentValue.startsWith(autoText)) {
                App.state.manualCommentStage1 = currentValue.substring(autoText.length).replace(/^, /, '');
            } else {
                App.state.manualCommentStage1 = currentValue;
            }
        } else {
            const autoText = App.state.autoCommentsStage2.join(', ');
            if (autoText && currentValue.startsWith(autoText)) {
                App.state.manualCommentStage2 = currentValue.substring(autoText.length).replace(/^, /, '');
            } else {
                App.state.manualCommentStage2 = currentValue;
            }
        }
    },

    initialize: function(stage1Comment, stage2Comment) {
        App.state.autoCommentsStage1 = this.generateStage1();
        App.state.autoCommentsStage2 = this.generateStage2();

        const expectedAuto1 = App.state.autoCommentsStage1.join(', ');
        const expectedAuto2 = App.state.autoCommentsStage2.join(', ');

        if (stage1Comment) {
            if (expectedAuto1 && stage1Comment.startsWith(expectedAuto1)) {
                App.state.manualCommentStage1 = stage1Comment.substring(expectedAuto1.length).replace(/^, /, '');
            } else {
                App.state.manualCommentStage1 = stage1Comment;
                App.state.autoCommentsStage1 = [];
            }
        } else {
            App.state.manualCommentStage1 = '';
        }

        if (stage2Comment) {
            if (expectedAuto2 && stage2Comment.startsWith(expectedAuto2)) {
                App.state.manualCommentStage2 = stage2Comment.substring(expectedAuto2.length).replace(/^, /, '');
            } else {
                App.state.manualCommentStage2 = stage2Comment;
                App.state.autoCommentsStage2 = [];
            }
        } else {
            App.state.manualCommentStage2 = '';
        }

        App.state.commentsInitialized = true;
    }
};

window.generateStage1Comments = () => App.comments.generateStage1();
window.generateStage2Comments = () => App.comments.generateStage2();
window.updateStage1Comment = () => App.comments.updateStage1();
window.updateStage2Comment = () => App.comments.updateStage2();
window.handleManualComment = (stage) => App.comments.handleManual(stage);
window.initializeComments = (c1, c2) => App.comments.initialize(c1, c2);