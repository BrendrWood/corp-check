 // 02-utils.js
 console.log('utils.js загружен');

 App.utils = {
     formatDateForDisplay: function(date) {
         if (!date) return '';
         if (typeof date === 'string' && date.includes('-')) {
             const [y, m, d] = date.split('T')[0].split('-');
             return `${d}.${m}.${y}`;
         }
         return date;
     },

     formatDateForInput: function(date) {
         if (!date) return '';
         if (typeof date === 'string' && date.includes('-')) {
             return date.split('T')[0];
         }
         return date;
     },

     formatDateForStorage: function(dateStr) {
         if (!dateStr) return null;
         if (dateStr.includes('.')) {
             const [d, m, y] = dateStr.split('.');
             return `${y}-${m}-${d}`;
         }
         return dateStr;
     },

     parsePastedDate: function(input) {
         input = input.trim();
         const shortYearRegex = /^(\d{2})\.(\d{2})\.(\d{2})$/;
         const match = input.match(shortYearRegex);

         if (match) {
             const day = match[1];
             const month = match[2];
             let year = match[3];
             const currentYear = new Date().getFullYear();
             const currentCentury = Math.floor(currentYear / 100) * 100;
             year = currentCentury + parseInt(year);
             if (year > currentYear + 1) year = year - 100;
             return `${day}.${month}.${year}`;
         }

         const fullYearRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
         const fullMatch = input.match(fullYearRegex);
         if (fullMatch) return input;
         return input;
     },

     formatStatus: function(status) {
         if (!status) return '<span class="badge bg-secondary">...</span>';
         if (status === 'OK') return '<span class="badge bg-success">OK</span>';
         return '<span class="badge bg-danger">NOK</span>';
     },

     escapeHtml: function(text) {
         if (!text) return '';
         const div = document.createElement('div');
         div.textContent = text;
         return div.innerHTML;
     },

     setValue: function(id, value) {
         const el = document.getElementById(id);
         if (el) el.value = value || '';
     },

     setChecked: function(id, value) {
         const el = document.getElementById(id);
         if (el) el.checked = value === true;
     },

     showNotification: function(msg, type = 'success') {
         const notif = document.createElement('div');
         notif.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
         notif.style.zIndex = 9999;
         notif.style.minWidth = '250px';
         notif.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
         notif.style.animation = 'slideIn 0.3s ease';
         notif.innerHTML = msg;
         document.body.appendChild(notif);
         setTimeout(() => notif.remove(), 2000);
     },

     disableModalFields: function(disabled) {
         App.FIELDS.ALL_FORM.forEach(id => {
             const el = document.getElementById(id);
             if (el) {
                 el.disabled = disabled;
                 el.style.backgroundColor = disabled ? '#f5f5f5' : '';
                 el.style.cursor = disabled ? 'not-allowed' : '';
             }
         });

         document.querySelectorAll('.btn-group .btn, .btn-primary, .btn-success, .btn-danger, .btn-outline-success, .btn-outline-danger, .btn-secondary').forEach(btn => {
             btn.disabled = disabled;
             btn.style.opacity = disabled ? '0.5' : '1';
             btn.style.pointerEvents = disabled ? 'none' : 'auto';
         });

         document.querySelectorAll('.form-check-input').forEach(cb => {
             cb.disabled = disabled;
         });
     }
 };

 // Глобальные функции-обертки
 window.formatDateForDisplay = (date) => App.utils.formatDateForDisplay(date);
 window.formatDateForInput = (date) => App.utils.formatDateForInput(date);
 window.formatDateForStorage = (dateStr) => App.utils.formatDateForStorage(dateStr);
 window.parsePastedDate = (input) => App.utils.parsePastedDate(input);
 window.formatStatus = (status) => App.utils.formatStatus(status);
 window.escapeHtml = (text) => App.utils.escapeHtml(text);
 window.setValue = (id, value) => App.utils.setValue(id, value);
 window.setChecked = (id, value) => App.utils.setChecked(id, value);
 window.showNotification = (msg, type) => App.utils.showNotification(msg, type);
 window.disableModalFields = (disabled) => App.utils.disableModalFields(disabled);