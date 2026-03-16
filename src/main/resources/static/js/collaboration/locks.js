// 06-locks.js
console.log('locks.js загружен');

App.locks = {
    handleEditingStatus: function(data) {
        console.log('Статус редактирования:', JSON.stringify(data, null, 2));

        if (data.applicationId !== App.state.currentApp?.id) return;

        const modalEditInfo = document.getElementById('modalEditInfo');
        const modalEditUser = document.getElementById('modalEditUser');
        const lockIndicator = document.getElementById('lockIndicator');
        const lockOwnerSpan = document.getElementById('lockOwner');

        if (!modalEditInfo || !modalEditUser) return;

        const owner = data.lockOwner || data.username || data.data?.lockOwner;

        if (owner && owner !== App.state.currentUser) {
            modalEditInfo.style.display = 'block';
            modalEditUser.textContent = owner;
            App.utils.disableModalFields(true);

            if (lockIndicator && lockOwnerSpan) {
                lockIndicator.style.display = 'flex';
                lockOwnerSpan.textContent = owner + ' редактирует эту заявку';
            }
        } else {
            modalEditInfo.style.display = 'none';
            App.utils.disableModalFields(false);
            if (lockIndicator) lockIndicator.style.display = 'none';
        }
    },

    releaseCurrentLock: function() {
        if (App.state.currentlyLockedApplicationId && App.state.stompClient?.connected) {
            console.log('Снимаем блокировку с заявки:', App.state.currentlyLockedApplicationId);
            App.state.stompClient.send("/app/edit.end", {}, JSON.stringify({
                applicationId: App.state.currentlyLockedApplicationId,
                stage: "all"
            }));
            App.state.currentlyLockedApplicationId = null;
        }
    }
};

window.handleEditingStatus = (data) => App.locks.handleEditingStatus(data);
window.releaseCurrentApplicationLock = () => App.locks.releaseCurrentLock();