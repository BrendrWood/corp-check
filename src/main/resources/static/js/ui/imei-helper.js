// 13-imei-helper.js
console.log('imei-helper.js загружен');

App.imeiHelper = {
    tooltipElement: null,
    currentImageData: null,
    isActive: false,
    isDragging: false,

    init: function() {
        const imeiField = document.getElementById('panelSerial');
        if (!imeiField) return;

        // Отключаем автозаполнение для поля IMEI
        imeiField.setAttribute('autocomplete', 'off');
        imeiField.setAttribute('autocorrect', 'off');
        imeiField.setAttribute('autocapitalize', 'off');
        imeiField.setAttribute('spellcheck', 'false');

        this.createTooltip();

        imeiField.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                this.handlePaste(e);
            }
        });

        imeiField.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });

        imeiField.addEventListener('input', (e) => {
            this.checkAutoHide(e.target.value);
        });

        imeiField.addEventListener('focus', () => {
            if (this.currentImageData) {
                this.positionTooltip();
                this.showTooltip();
            }
        });

        // Закрытие только при клике вне подсказки и не на поле IMEI
        document.addEventListener('click', (e) => {
            if (this.isActive && this.currentImageData && !this.isDragging) {
                if (!this.tooltipElement?.contains(e.target) &&
                    e.target !== imeiField &&
                    !e.target.closest('#clearImeiImageBtn')) {
                    this.hideTooltip();
                }
            }
        });

        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.addEventListener('scroll', () => {
                if (this.isActive && this.currentImageData && !this.isDragging) {
                    this.positionTooltip();
                }
            });
        }

        window.addEventListener('resize', () => {
            if (this.isActive && this.currentImageData && !this.isDragging) {
                this.positionTooltip();
            }
        });

        console.log('IMEI Helper инициализирован');
    },

    createTooltip: function() {
        if (this.tooltipElement) return;

        const tooltip = document.createElement('div');
        tooltip.id = 'imei-image-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            display: none;
            z-index: 1060;
            background: var(--bg-secondary);
            border: 2px solid var(--primary);
            border-radius: 12px;
            padding: 8px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            max-width: 600px;
            max-height: 400px;
            overflow: hidden;
            cursor: default;
            transition: opacity 0.2s ease;
            resize: both;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--border-color);
            font-size: 12px;
            color: var(--text-muted);
            cursor: move;
        `;
        header.innerHTML = `
            <span><i class="bi bi-image"></i> IMEI с изображения</span>
            <span class="resize-handle" style="cursor: se-resize; font-size: 16px;">↘️</span>
        `;

        const img = document.createElement('img');
        img.id = 'imei-tooltip-image';
        img.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
            border-radius: 6px;
            pointer-events: none;
        `;

        tooltip.appendChild(header);
        tooltip.appendChild(img);
        document.body.appendChild(tooltip);

        this.tooltipElement = tooltip;
        this.imageElement = img;

        // Закрытие по клику на подсказку (не на заголовок)
        tooltip.addEventListener('click', (e) => {
            if (!e.target.closest('.resize-handle') && !e.target.closest('.chat-header')) {
                this.hideTooltip();
            }
        });

        this.makeDraggable(tooltip, header);
        this.makeResizable(tooltip);
    },

    makeDraggable: function(element, handle) {
        let offsetX, offsetY;

        const onMouseDown = (e) => {
            if (e.target.classList.contains('resize-handle')) return;

            this.isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            element.style.cursor = 'grabbing';
            element.style.transition = 'none';
            element.style.userSelect = 'none';

            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!this.isDragging) return;

            const left = e.clientX - offsetX;
            const top = e.clientY - offsetY;

            element.style.left = left + 'px';
            element.style.top = top + 'px';
            element.style.bottom = 'auto';
            element.style.right = 'auto';
        };

        const onMouseUp = () => {
            if (this.isDragging) {
                this.isDragging = false;
                element.style.cursor = 'default';
                element.style.transition = '';
                element.style.userSelect = '';
            }
        };

        handle.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    },

    makeResizable: function(element) {
        const resizeHandle = element.querySelector('.resize-handle');
        if (!resizeHandle) return;

        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        const onMouseDown = (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);

            element.style.transition = 'none';
            e.preventDefault();
            e.stopPropagation();
        };

        const onMouseMove = (e) => {
            if (!isResizing) return;

            const width = Math.max(300, startWidth + (e.clientX - startX));
            const height = Math.max(200, startHeight + (e.clientY - startY));

            element.style.width = width + 'px';
            element.style.height = height + 'px';
            element.querySelector('img').style.maxHeight = (height - 50) + 'px';
        };

        const onMouseUp = () => {
            if (isResizing) {
                isResizing = false;
                element.style.transition = '';
            }
        };

        resizeHandle.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    },

    handlePaste: async function(e) {
        const imeiField = document.getElementById('panelSerial');
        if (!imeiField || document.activeElement !== imeiField) return;

        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();

                const blob = items[i].getAsFile();
                const imageDataUrl = await this.blobToDataURL(blob);

                this.currentImageData = imageDataUrl;
                this.imageElement.src = imageDataUrl;

                this.positionTooltip();
                this.showTooltip();

                const clearBtn = document.getElementById('clearImeiImageBtn');
                if (clearBtn) clearBtn.style.display = 'inline-block';

                console.log('Изображение вставлено в подсказку IMEI');
                break;
            }
        }
    },

    blobToDataURL: function(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(blob);
        });
    },

    positionTooltip: function() {
        if (!this.tooltipElement || !this.currentImageData) return;

        const imeiField = document.getElementById('panelSerial');
        if (!imeiField) return;

        const rect = imeiField.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        let top = rect.top + scrollTop - this.tooltipElement.offsetHeight - 10;
        let left = rect.left + scrollLeft;

        if (top < scrollTop + 10) {
            top = rect.bottom + scrollTop + 10;
        }

        const maxLeft = window.innerWidth - this.tooltipElement.offsetWidth - 10;
        if (left > maxLeft) {
            left = maxLeft;
        }

        if (left < 10) {
            left = 10;
        }

        this.tooltipElement.style.top = top + 'px';
        this.tooltipElement.style.left = left + 'px';
    },

    showTooltip: function() {
        if (!this.tooltipElement || !this.currentImageData) return;

        this.tooltipElement.style.display = 'block';
        this.isActive = true;
        this.tooltipElement.style.animation = 'imeiTooltipFadeIn 0.2s ease';
    },

    hideTooltip: function() {
        if (this.tooltipElement) {
            this.tooltipElement.style.display = 'none';
        }
        this.isActive = false;
        this.isDragging = false;
    },

    checkAutoHide: function(value) {
        if (!this.isActive || !this.currentImageData || this.isDragging) return;

        const digitsOnly = value.replace(/\D/g, '');

        if (digitsOnly.length >= 15) {
            if (value.includes(',')) {
                const parts = value.split(',');
                const lastPart = parts[parts.length - 1].replace(/\D/g, '');

                if (lastPart.length >= 15) {
                    this.hideTooltip();
                    if (App.utils && App.utils.showNotification) {
                        App.utils.showNotification('✓ IMEI введен', 'success');
                    }

                    const clearBtn = document.getElementById('clearImeiImageBtn');
                    if (clearBtn) clearBtn.style.display = 'none';
                }
            } else {
                this.hideTooltip();
                if (App.utils && App.utils.showNotification) {
                    App.utils.showNotification('✓ IMEI введен', 'success');
                }

                const clearBtn = document.getElementById('clearImeiImageBtn');
                if (clearBtn) clearBtn.style.display = 'none';
            }
        }
    },

    clearImage: function() {
        this.currentImageData = null;
        if (this.imageElement) {
            this.imageElement.src = '';
        }
        this.hideTooltip();

        const clearBtn = document.getElementById('clearImeiImageBtn');
        if (clearBtn) clearBtn.style.display = 'none';

        if (App.utils && App.utils.showNotification) {
            App.utils.showNotification('Изображение очищено', 'info');
        }
    }
};

const style = document.createElement('style');
style.textContent = `
    @keyframes imeiTooltipFadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    #imei-image-tooltip {
        transition: opacity 0.2s ease;
    }

    #imei-image-tooltip:hover {
        box-shadow: 0 12px 30px rgba(0,0,0,0.3);
    }

    [data-theme="dark"] #imei-image-tooltip {
        background: #2d333b;
        border-color: #7209b7;
    }
`;

document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (App.imeiHelper) {
            App.imeiHelper.init();
        }
    }, 600);
});

document.addEventListener('modalOpened', function() {
    setTimeout(() => {
        if (App.imeiHelper) {
            App.imeiHelper.init();
        }
    }, 100);
});