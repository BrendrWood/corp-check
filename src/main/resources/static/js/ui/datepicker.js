// 12-datepicker.js
console.log('datepicker.js загружен');

App.datepicker = {
    init: function() {
        const dateInput = document.getElementById('searchDate');
        const calendarIcon = document.querySelector('#searchDate')?.previousElementSibling;

        if (!dateInput || !calendarIcon) return;

        // Создаем контейнер для календаря
        const calendarContainer = document.createElement('div');
        calendarContainer.id = 'datepicker-calendar';
        calendarContainer.className = 'datepicker-calendar';
        calendarContainer.style.display = 'none';
        calendarContainer.style.position = 'absolute';
        calendarContainer.style.zIndex = '9999';
        calendarContainer.style.background = 'white';
        calendarContainer.style.border = '1px solid #ddd';
        calendarContainer.style.borderRadius = '8px';
        calendarContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        calendarContainer.style.padding = '10px';
        calendarContainer.style.width = '280px';

        document.body.appendChild(calendarContainer);

        // Обработчик клика по иконке календаря
        calendarIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleCalendar(dateInput, calendarContainer);
        });

        // Закрываем календарь при клике вне его
        document.addEventListener('click', (e) => {
            if (!calendarContainer.contains(e.target) && e.target !== calendarIcon && !calendarIcon.contains(e.target)) {
                calendarContainer.style.display = 'none';
            }
        });

        // Обработчик для поля ввода (ручной ввод)
        dateInput.addEventListener('focus', () => {
            this.showCalendar(dateInput, calendarContainer);
        });

        // Сохраняем ссылки
        this.dateInput = dateInput;
        this.calendarContainer = calendarContainer;
    },

    toggleCalendar: function(dateInput, calendarContainer) {
        if (calendarContainer.style.display === 'none' || calendarContainer.style.display === '') {
            this.showCalendar(dateInput, calendarContainer);
        } else {
            calendarContainer.style.display = 'none';
        }
    },

    showCalendar: function(dateInput, calendarContainer) {
        // Позиционируем календарь под полем ввода
        const rect = dateInput.getBoundingClientRect();
        calendarContainer.style.top = (rect.bottom + window.scrollY + 5) + 'px';
        calendarContainer.style.left = (rect.left + window.scrollX) + 'px';

        // Получаем текущую дату из поля или используем сегодня
        let currentDate = new Date();
        if (dateInput.value) {
            const parts = dateInput.value.split('.');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    currentDate = new Date(year, month, day);
                }
            }
        }

        this.renderCalendar(calendarContainer, currentDate, (selectedDate) => {
            // Форматируем выбранную дату
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear();
            dateInput.value = `${day}.${month}.${year}`;

            // Скрываем календарь
            calendarContainer.style.display = 'none';

            // Автоматически запускаем поиск по выбранной дате
            if (window.performSearch) {
                window.performSearch();
            }
        });

        calendarContainer.style.display = 'block';
    },

    renderCalendar: function(container, currentDate, onSelect) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();

        // Названия месяцев
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        // Дни недели
        const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

        // Получаем первый день месяца (0 = воскресенье, 1 = понедельник и т.д.)
        const firstDay = new Date(year, month, 1).getDay();
        // Преобразуем в понедельник = 0, воскресенье = 6
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;

        // Получаем последний день месяца
        const lastDate = new Date(year, month + 1, 0).getDate();

        // Генерируем HTML
        let html = `
            <div class="datepicker-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #eee;">
                <button class="datepicker-nav-btn" data-action="prev" style="background: none; border: none; cursor: pointer; font-size: 16px;">&lt;</button>
                <span style="font-weight: bold;">${monthNames[month]} ${year}</span>
                <button class="datepicker-nav-btn" data-action="next" style="background: none; border: none; cursor: pointer; font-size: 16px;">&gt;</button>
            </div>
            <div class="datepicker-weekdays" style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 5px; font-size: 12px; color: #666;">
                ${weekDays.map(day => `<div>${day}</div>`).join('')}
            </div>
            <div class="datepicker-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;">
        `;

        // Пустые ячейки для дней предыдущего месяца
        for (let i = 0; i < startOffset; i++) {
            html += '<div></div>';
        }

        // Ячейки для дней текущего месяца
        for (let d = 1; d <= lastDate; d++) {
            const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayClass = isToday ? 'datepicker-today' : '';
            html += `<div class="datepicker-day ${dayClass}" data-date="${year}-${month+1}-${d}" style="text-align: center; padding: 6px 0; cursor: pointer; border-radius: 4px; ${isToday ? 'background-color: #e3f2fd; font-weight: bold;' : ''}">${d}</div>`;
        }

        html += '</div>';

        // Кнопка "Сегодня"
        html += `
            <div style="margin-top: 10px; text-align: center; border-top: 1px solid #eee; padding-top: 8px;">
                <button class="datepicker-today-btn" style="background: #4361ee; color: white; border: none; border-radius: 4px; padding: 5px 12px; cursor: pointer; font-size: 13px;">Сегодня</button>
            </div>
        `;

        container.innerHTML = html;

        // Добавляем обработчики для дней
        container.querySelectorAll('.datepicker-day').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const dateStr = dayEl.dataset.date;
                const [y, m, d] = dateStr.split('-').map(Number);
                onSelect(new Date(y, m - 1, d));
            });

            // Hover эффект
            dayEl.addEventListener('mouseenter', () => {
                dayEl.style.backgroundColor = '#f0f0f0';
            });
            dayEl.addEventListener('mouseleave', () => {
                if (!dayEl.classList.contains('datepicker-today')) {
                    dayEl.style.backgroundColor = '';
                }
            });
        });

        // Обработчики навигации
        container.querySelector('[data-action="prev"]')?.addEventListener('click', () => {
            const prevMonth = new Date(year, month - 1, 1);
            this.renderCalendar(container, prevMonth, onSelect);
        });

        container.querySelector('[data-action="next"]')?.addEventListener('click', () => {
            const nextMonth = new Date(year, month + 1, 1);
            this.renderCalendar(container, nextMonth, onSelect);
        });

        // Обработчик кнопки "Сегодня"
        container.querySelector('.datepicker-today-btn')?.addEventListener('click', () => {
            onSelect(new Date());
        });
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Даем время на загрузку всех модулей
    setTimeout(() => {
        if (App.datepicker) {
            App.datepicker.init();
        }
    }, 500);
});