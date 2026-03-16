// 15-modal.js
console.log('modal.js загружен');

App.modal = {

    getFormHtml: function(appNumber, engineerName) {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const formattedToday = `${day}.${month}.${year}`;

        return `
            <div class="row">
                <div class="col-md-6">
                    <div class="bg-primary bg-opacity-10 p-3 rounded" style="border-left: 4px solid #0d6efd;">
                        <h6 class="mb-3">Этап 1</h6>

                        <div class="mb-2">
                            <label>Номер заявки *</label>
                            <input type="text" class="form-control" id="appNumber" value="${appNumber || ''}" placeholder="Введите номер заявки" required>
                        </div>

                        <div class="mb-2">
                            <label>Инженер *</label>
                            <input type="text" class="form-control" id="engineerName" value="${engineerName || ''}" placeholder="Введите ФИО инженера" required>
                        </div>

                        <div class="mb-2">
                            <label>Дата монтажа</label>
                            <input type="text" class="form-control" id="installDate" value="${formattedToday}"
                                   placeholder="ДД.ММ.ГГГГ" onpaste="window.handleDatePaste(event)">
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="panelNumberAssigned">
                            <label class="form-check-label" for="panelNumberAssigned">Пультовой прописан</label>
                        </div>

                        <div class="mb-2">
                            <label>IMEI</label>
                            <input type="text" class="form-control" id="panelSerial" placeholder="Серийный номер/IMEI" autocomplete="off">
                            <div class="imei-helper-controls" style="display: flex; gap: 5px; margin-top: 5px;">
                                <small class="text-muted">Ctrl+V для вставки изображения</small>
                                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="if(App.imeiHelper) App.imeiHelper.clearImage()" style="display: none;" id="clearImeiImageBtn">
                                    <i class="bi bi-x-circle"></i> Очистить
                                </button>
                            </div>
                        </div>

                        <div class="mb-2">
                            <input type="text" class="form-control" id="gsmLevel" placeholder="Уровень GSM">
                        </div>

                        <div class="mb-2">
                            <select class="form-control" id="sensorPhoto">
                                <option value="false">Фото уровня связи: Нет</option>
                                <option value="true">Да</option>
                                <option value="wired">Проводная</option>
                            </select>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="panicSignal" onchange="window.updateStage1Comment()">
                            <label class="form-check-label" for="panicSignal">КТС 120/122</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="csmSignal" onchange="window.updateStage1Comment()">
                            <label class="form-check-label" for="csmSignal">Сигналы КТС на ЦСМ</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="instruction">
                            <label class="form-check-label" for="instruction">Наклеена инструкция</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="arming" onchange="window.updateStage1Comment()">
                            <label class="form-check-label" for="arming">Пост/снятие</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="backup" onchange="window.updateStage1Comment()">
                            <label class="form-check-label" for="backup">Резервное питание</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="ceilings">
                            <label class="form-check-label" for="ceilings">Высокие потолки</label>
                        </div>

                        <div class="row">
                            <div class="col-6">
                                <label>Дата ОП1</label>
                                <input type="date" class="form-control" id="stage1Date" value="${App.utils.formatDateForInput(new Date().toISOString())}">
                            </div>
                            <div class="col-6">
                                <label>Проверяющий</label>
                                <input type="text" class="form-control" id="stage1Inspector" value="${App.state.currentUser}">
                            </div>
                        </div>

                        <div class="mb-2 mt-2">
                            <label>Комментарий ОП1</label>
                            <textarea class="form-control" id="stage1Comment" rows="2" oninput="window.handleManualComment(1)"></textarea>
                            <button class="btn btn-sm btn-outline-secondary mt-1 w-100" onclick="window.copyToClipboard('stage1Comment', this)">
                                <i class="bi bi-clipboard"></i> Копировать
                            </button>
                        </div>

                        <div class="mt-2">
                            <label>Статус ОП1:</label>
                            <div class="btn-group w-100" id="stage1StatusGroup">
                                <button type="button" class="btn btn-sm btn-outline-success" onclick="window.setStatus('stage1', 'OK', this)">OK</button>
                                <button type="button" class="btn btn-sm btn-outline-danger" onclick="window.setStatus('stage1', 'NOK', this)">NOK</button>
                            </div>
                            <input type="hidden" id="stage1Status">
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="bg-success bg-opacity-10 p-3 rounded" style="border-left: 4px solid #198754;">
                        <h6 class="mb-3">Этап 2</h6>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="rental">
                            <label class="form-check-label" for="rental">Аренда</label>
                        </div>

                        <div class="mb-2" id="rentalCommentBlock" style="display: none;">
                            <label>Комментарий аренды</label>
                            <input type="text" class="form-control" id="rentalComment" placeholder="Введите комментарий...">
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="sticker">
                            <label class="form-check-label" for="sticker">Наклейка</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="photos" onchange="window.updateStage2Comment()">
                            <label class="form-check-label" for="photos">Фото объекта, КП, КЛ, СИМ</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="form002" onchange="window.updateStage2Comment()">
                            <label class="form-check-label" for="form002">Форма 002</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="avr" onchange="window.updateStage2Comment()">
                            <label class="form-check-label" for="avr">АВР</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="defect">
                            <label class="form-check-label" for="defect">Деф.акт</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="roads" onchange="window.updateStage2Comment()">
                            <label class="form-check-label" for="roads">Подъездные пути</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="plan" onchange="window.updateStage2Comment()">
                            <label class="form-check-label" for="plan">План</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="fireAlarm">
                            <label class="form-check-label" for="fireAlarm">ПС</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="electronic" onchange="window.updateStage2Comment()">
                            <label class="form-check-label" for="electronic">Эл.чек-лист</label>
                        </div>

                        <div class="mb-2" id="fireAlarmBlock" style="display:none;">
                            <select class="form-control" id="fireAlarmChecklist">
                                <option value="">Чек-лист ПС...</option>
                                <option value="YES">Да</option>
                                <option value="NO">Нет</option>
                                <option value="GOS_MONTAZH">Монтаж ГОС</option>
                            </select>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="issues">
                            <label class="form-check-label" for="issues">Неисправности после монтажа</label>
                        </div>

                        <div class="mb-2 form-check">
                            <input type="checkbox" class="form-check-input" id="incomplete">
                            <label class="form-check-label" for="incomplete">Неполная форма 002</label>
                        </div>

                        <div class="row mt-2">
                            <div class="col-6">
                                <label>Дата ОП2</label>
                                <input type="date" class="form-control" id="stage2Date" value="${App.utils.formatDateForInput(new Date().toISOString())}">
                            </div>
                            <div class="col-6">
                                <label>Проверяющий</label>
                                <input type="text" class="form-control" id="stage2Inspector" value="${App.state.currentUser}">
                            </div>
                        </div>

                        <div class="mb-2 mt-2">
                            <label>Комментарий ОП2</label>
                            <textarea class="form-control" id="stage2Comment" rows="2" oninput="window.handleManualComment(2)"></textarea>
                            <button class="btn btn-sm btn-outline-secondary mt-1 w-100" onclick="window.copyToClipboard('stage2Comment', this)">
                                <i class="bi bi-clipboard"></i> Копировать
                            </button>
                        </div>

                        <div class="mt-2">
                            <label>Статус ОП2:</label>
                            <div class="btn-group w-100" id="stage2StatusGroup">
                                <button type="button" class="btn btn-sm btn-outline-success" onclick="window.setStatus('stage2', 'OK', this)">OK</button>
                                <button type="button" class="btn btn-sm btn-outline-danger" onclick="window.setStatus('stage2', 'NOK', this)">NOK</button>
                            </div>
                            <input type="hidden" id="stage2Status">
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    fillData: function(app) {
        App.state.commentsInitialized = false;

        App.utils.setValue('appNumber', app.applicationNumber);
        App.utils.setValue('engineerName', app.engineerName);

        if (app.installationDate) {
            App.utils.setValue('installDate', App.utils.formatDateForDisplay(app.installationDate));
        }

        App.utils.setChecked('panelNumberAssigned', app.panelNumberAssigned);
        App.utils.setValue('panelSerial', app.panelSerial);

        let stage1Comment = '', stage2Comment = '';

        if (app.stageOne) {
            App.utils.setValue('gsmLevel', app.stageOne.gsmLevel);
            App.utils.setValue('sensorPhoto', app.stageOne.sensorConnectionPhoto || 'false');
            App.utils.setChecked('panicSignal', app.stageOne.panicSignalType);
            App.utils.setChecked('csmSignal', app.stageOne.csmPanicSignal);
            App.utils.setChecked('instruction', app.stageOne.instructionSticker);
            App.utils.setChecked('arming', app.stageOne.armingDisarming);
            App.utils.setChecked('backup', app.stageOne.backupPower);
            App.utils.setChecked('ceilings', app.stageOne.highCeilings);
            App.utils.setValue('stage1Date', app.stageOne.checkDate);
            App.utils.setValue('stage1Inspector', app.stageOne.inspector);

            stage1Comment = app.stageOne.comments || '';

            if (app.stageOne.status) {
                const btn = document.querySelector(`#stage1StatusGroup .btn-${app.stageOne.status === 'OK' ? 'outline-success' : 'outline-danger'}`);
                if (btn) this.setStatus('stage1', app.stageOne.status, btn);
            }
        }

        if (app.stageTwo) {
            App.utils.setChecked('rental', app.stageTwo.equipmentRental);

            // Показываем блок комментария аренды, если чекбокс установлен
            if (app.stageTwo.equipmentRental) {
                const block = document.getElementById('rentalCommentBlock');
                if (block) block.style.display = 'block';
                App.utils.setValue('rentalComment', app.stageTwo.rentalComment);
            }

            App.utils.setChecked('sticker', app.stageTwo.stickersStandard);
            App.utils.setChecked('photos', app.stageTwo.systemPhotos);
            App.utils.setChecked('form002', app.stageTwo.form002Filled);
            App.utils.setChecked('avr', app.stageTwo.acceptanceCertificate);
            App.utils.setChecked('defect', app.stageTwo.defectAct);
            App.utils.setChecked('roads', app.stageTwo.accessRoads);
            App.utils.setChecked('plan', app.stageTwo.floorPlan);
            App.utils.setChecked('fireAlarm', app.stageTwo.fireAlarm);
            App.utils.setChecked('electronic', app.stageTwo.electronicChecklist);
            App.utils.setChecked('issues', app.stageTwo.postInstallationIssues);
            App.utils.setChecked('incomplete', app.stageTwo.incompleteForm002);

            if (app.stageTwo.fireAlarm) {
                const block = document.getElementById('fireAlarmBlock');
                if (block) block.style.display = 'block';
                App.utils.setValue('fireAlarmChecklist', app.stageTwo.fireAlarmChecklist);
            }

            App.utils.setValue('stage2Date', app.stageTwo.checkDate);
            App.utils.setValue('stage2Inspector', app.stageTwo.inspector);

            stage2Comment = app.stageTwo.comments || '';

            if (app.stageTwo.status) {
                const btn = document.querySelector(`#stage2StatusGroup .btn-${app.stageTwo.status === 'OK' ? 'outline-success' : 'outline-danger'}`);
                if (btn) this.setStatus('stage2', app.stageTwo.status, btn);
            }
        }

        if (App.comments && App.comments.initialize) {
            App.comments.initialize(stage1Comment, stage2Comment);
        }

        setTimeout(() => {
            if (App.comments) {
                if (App.comments.updateStage1) App.comments.updateStage1();
                if (App.comments.updateStage2) App.comments.updateStage2();
            }
        }, 100);
    },

    setStatus: function(stage, value, btn) {
        if (!btn) return;

        const statusInput = document.getElementById(stage + 'Status');
        if (statusInput) statusInput.value = value;

        const group = btn.closest('.btn-group');
        if (!group) return;

        group.querySelectorAll('.btn').forEach(b => {
            b.classList.remove('btn-success', 'btn-danger');
            b.classList.add('btn-outline-success', 'btn-outline-danger');
        });

        btn.classList.remove('btn-outline-success', 'btn-outline-danger');
        btn.classList.add(value === 'OK' ? 'btn-success' : 'btn-danger');

        if (App.state.currentApp && App.collab) {
            App.collab.notifyFieldChange(App.state.currentApp.id, stage + 'Status', value);
        }
    },

    setupStyles: function() {
        const rental = document.getElementById('rental');
        if (rental) {
            rental.addEventListener('change', function() {
                const block = document.getElementById('rentalCommentBlock');
                if (block) {
                    block.style.display = this.checked ? 'block' : 'none';
                }
            });
        }

        const fireAlarm = document.getElementById('fireAlarm');
        if (fireAlarm) {
            fireAlarm.addEventListener('change', function() {
                const block = document.getElementById('fireAlarmBlock');
                if (block) {
                    block.style.display = this.checked ? 'block' : 'none';
                }
            });
        }

        if (App.FIELDS) {
            App.FIELDS.STAGE1_COMMENT.forEach(id => {
                const cb = document.getElementById(id);
                if (cb) {
                    cb.removeEventListener('change', App.comments?.updateStage1);
                    cb.addEventListener('change', function() {
                        if (App.comments && App.comments.updateStage1) App.comments.updateStage1();
                        if (App.state.currentApp && App.collab) {
                            App.collab.notifyFieldChange(App.state.currentApp.id, id, cb.checked);
                        }
                    });
                }
            });

            App.FIELDS.STAGE2_COMMENT.forEach(id => {
                const cb = document.getElementById(id);
                if (cb) {
                    cb.removeEventListener('change', App.comments?.updateStage2);
                    cb.addEventListener('change', function() {
                        if (App.comments && App.comments.updateStage2) App.comments.updateStage2();
                        if (App.state.currentApp && App.collab) {
                            App.collab.notifyFieldChange(App.state.currentApp.id, id, cb.checked);
                        }
                    });
                }
            });

            App.FIELDS.TEXT_FIELDS.forEach(id => {
                const field = document.getElementById(id);
                if (field) {
                    field.addEventListener('input', function() {
                        if (App.state.currentApp && App.collab) {
                            App.collab.notifyFieldChange(App.state.currentApp.id, id, field.value);
                        }
                    });
                }
            });
        }

        const imeiField = document.getElementById('panelSerial');
        const clearBtn = document.getElementById('clearImeiImageBtn');

        if (imeiField && clearBtn) {
            imeiField.addEventListener('focus', () => {
                if (App.imeiHelper && App.imeiHelper.currentImageData) {
                    clearBtn.style.display = 'inline-block';
                }
            });

            imeiField.addEventListener('blur', () => {
                setTimeout(() => {
                    if (!imeiField.matches(':focus')) {
                        clearBtn.style.display = 'none';
                    }
                }, 200);
            });
        }
    },

    save: async function() {
        const appNumber = document.getElementById('appNumber')?.value;
        const engineerName = document.getElementById('engineerName')?.value;

        if (!appNumber || !engineerName) {
            alert('Заполните обязательные поля (Номер заявки и Инженер)');
            return;
        }

        let installDate = document.getElementById('installDate')?.value;
        installDate = App.utils.formatDateForStorage(installDate);

        const rentalChecked = document.getElementById('rental')?.checked || false;
        const rentalComment = rentalChecked ? document.getElementById('rentalComment')?.value : 'не требуется';

        const data = {
            applicationNumber: appNumber,
            engineerName: engineerName,
            panelNumberAssigned: document.getElementById('panelNumberAssigned')?.checked || false,
            panelSerial: document.getElementById('panelSerial')?.value,
            installationDate: installDate,

            stageOne: {
                gsmLevel: document.getElementById('gsmLevel')?.value,
                sensorConnectionPhoto: document.getElementById('sensorPhoto')?.value || 'false',
                panicSignalType: document.getElementById('panicSignal')?.checked || false,
                csmPanicSignal: document.getElementById('csmSignal')?.checked || false,
                instructionSticker: document.getElementById('instruction')?.checked || false,
                armingDisarming: document.getElementById('arming')?.checked || false,
                backupPower: document.getElementById('backup')?.checked || false,
                highCeilings: document.getElementById('ceilings')?.checked || false,
                checkDate: document.getElementById('stage1Date')?.value,
                inspector: document.getElementById('stage1Inspector')?.value,
                comments: document.getElementById('stage1Comment')?.value,
                status: document.getElementById('stage1Status')?.value || null
            },

            stageTwo: {
                equipmentRental: rentalChecked,
                rentalComment: rentalComment,
                stickersStandard: document.getElementById('sticker')?.checked || false,
                systemPhotos: document.getElementById('photos')?.checked || false,
                form002Filled: document.getElementById('form002')?.checked || false,
                accessRoads: document.getElementById('roads')?.checked || false,
                floorPlan: document.getElementById('plan')?.checked || false,
                fireAlarm: document.getElementById('fireAlarm')?.checked || false,
                fireAlarmChecklist: document.getElementById('fireAlarmChecklist')?.value || null,
                acceptanceCertificate: document.getElementById('avr')?.checked || false,
                defectAct: document.getElementById('defect')?.checked || false,
                electronicChecklist: document.getElementById('electronic')?.checked || false,
                postInstallationIssues: document.getElementById('issues')?.checked || false,
                incompleteForm002: document.getElementById('incomplete')?.checked || false,
                checkDate: document.getElementById('stage2Date')?.value,
                inspector: document.getElementById('stage2Inspector')?.value,
                comments: document.getElementById('stage2Comment')?.value,
                status: document.getElementById('stage2Status')?.value || null
            }
        };

        try {
            let response;
            if (App.state.currentApp && App.state.currentApp.id) {
                response = await fetch(`/api/corp/applications/${App.state.currentApp.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch('/api/corp/applications', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
            }

            if (response.ok) {
                if (App.state.stompClient && App.state.stompClient.connected && App.state.currentApp && App.collab) {
                    App.state.stompClient.send("/app/application.update", {}, JSON.stringify({
                        applicationId: App.state.currentApp.id,
                        data: data,
                        username: App.state.currentUser
                    }));
                }

                const modal = bootstrap.Modal.getInstance(document.getElementById('appModal'));
                if (modal) modal.hide();

                if (App.data && App.data.loadAll) {
                    await App.data.loadAll();
                }

                App.utils.showNotification(App.state.currentApp ? 'Заявка обновлена!' : 'Заявка создана!');

                if (App.imeiHelper) {
                    App.imeiHelper.clearImage();
                }
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения: ' + error.message);
        }
    },

    openCreate: function() {
        if (App.locks && App.locks.releaseCurrentLock) {
            App.locks.releaseCurrentLock();
        }

        App.state.currentApp = null;
        document.getElementById('modalTitle').innerHTML = '<i class="bi bi-plus-circle"></i> Новая заявка';
        document.getElementById('modalBody').innerHTML = this.getFormHtml(null, null);

        if (App.comments) {
            App.state.autoCommentsStage1 = [];
            App.state.autoCommentsStage2 = [];
            App.state.manualCommentStage1 = '';
            App.state.manualCommentStage2 = '';
            App.state.commentsInitialized = false;
        }

        this.setupStyles();

        setTimeout(() => {
            if (App.comments) {
                if (App.comments.updateStage1) App.comments.updateStage1();
                if (App.comments.updateStage2) App.comments.updateStage2();
            }
            if (App.imeiHelper && App.imeiHelper.init) {
                App.imeiHelper.init();
            }
        }, 100);

        const modal = new bootstrap.Modal(document.getElementById('appModal'));
        modal.show();

        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('modalOpened'));
        }, 200);
    },

    openEdit: async function(id) {
        if (App.locks && App.locks.releaseCurrentLock) {
            App.locks.releaseCurrentLock();
        }

        try {
            const response = await fetch(`/api/corp/applications/${id}`);
            if (!response.ok) throw new Error('Ошибка загрузки');

            const app = await response.json();
            App.state.currentApp = app;

            document.getElementById('modalTitle').innerHTML = `<i class="bi bi-pencil"></i> Заявка ${app.applicationNumber}`;
            document.getElementById('modalBody').innerHTML = this.getFormHtml(app.applicationNumber, app.engineerName);

            if (App.collab) {
                if (App.collab.subscribeToLocks) App.collab.subscribeToLocks(id);
                if (App.collab.subscribeToViewers) App.collab.subscribeToViewers(id);
                if (App.collab.subscribeToFieldChanges) App.collab.subscribeToFieldChanges(id);
                if (App.collab.subscribeToScrollSync) App.collab.subscribeToScrollSync(id);
                if (App.collab.notifyView) App.collab.notifyView(id);
            }

            if (App.state.stompClient && App.state.stompClient.connected) {
                App.state.stompClient.send("/app/edit.check", {}, JSON.stringify({ applicationId: id }));

                setTimeout(() => {
                    if (App.state.stompClient) {
                        App.state.stompClient.send("/app/edit.start", {}, JSON.stringify({
                            applicationId: id,
                            stage: "all"
                        }));
                    }
                    App.state.currentlyLockedApplicationId = id;
                }, 500);
            }

            if (app.currentLockOwner && app.currentLockOwner !== App.state.currentUser) {
                document.getElementById('modalEditInfo').style.display = 'block';
                document.getElementById('modalEditUser').textContent = app.currentLockOwner;
                if (App.utils && App.utils.disableModalFields) {
                    App.utils.disableModalFields(true);
                }

                const lockIndicator = document.getElementById('lockIndicator');
                const lockOwner = document.getElementById('lockOwner');
                if (lockIndicator && lockOwner) {
                    lockIndicator.style.display = 'flex';
                    lockOwner.textContent = app.currentLockOwner + ' редактирует эту заявку';
                }
            } else {
                document.getElementById('modalEditInfo').style.display = 'none';
                if (App.utils && App.utils.disableModalFields) {
                    App.utils.disableModalFields(false);
                }
                const lockIndicator = document.getElementById('lockIndicator');
                if (lockIndicator) lockIndicator.style.display = 'none';
            }

            setTimeout(() => {
                this.fillData(app);
                this.setupStyles();
                if (App.imeiHelper && App.imeiHelper.init) {
                    App.imeiHelper.init();
                }
            }, 100);

            const modal = new bootstrap.Modal(document.getElementById('appModal'));
            modal.show();

            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('modalOpened'));
            }, 200);

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            alert('Ошибка загрузки заявки');
        }
    },

    handleDatePaste: function(event) {
        event.preventDefault();
        const pastedText = (event.clipboardData || window.clipboardData).getData('text');
        event.target.value = App.utils.parsePastedDate(pastedText);
    },

    copyToClipboard: function(elementId, buttonElement) {
        const element = document.getElementById(elementId);
        if (!element) return;

        navigator.clipboard.writeText(element.value).then(() => {
            const originalText = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="bi bi-check"></i> Скопировано!';
            buttonElement.classList.add('btn-success');
            buttonElement.classList.remove('btn-outline-secondary');

            setTimeout(() => {
                buttonElement.innerHTML = originalText;
                buttonElement.classList.remove('btn-success');
                buttonElement.classList.add('btn-outline-secondary');
            }, 2000);
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            alert('Не удалось скопировать текст');
        });
    }
};

window.getModalFormHtml = (appNumber, engineerName) => App.modal.getFormHtml(appNumber, engineerName);
window.fillModalData = (app) => App.modal.fillData(app);
window.setupModalStyles = () => App.modal.setupStyles();
window.setStatus = (stage, value, btn) => App.modal.setStatus(stage, value, btn);
window.handleDatePaste = (event) => App.modal.handleDatePaste(event);
window.copyToClipboard = (elementId, buttonElement) => App.modal.copyToClipboard(elementId, buttonElement);
window.saveApplication = () => App.modal.save();
window.openCreateModal = () => App.modal.openCreate();
window.openEditModal = (id) => App.modal.openEdit(id);