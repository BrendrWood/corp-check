// 01-constants.js
console.log('constants.js загружен');

// Единый глобальный объект
window.App = window.App || {};

// Константы для полей
App.FIELDS = {
    STAGE1_COMMENT: ['panicSignal', 'csmSignal', 'arming', 'backup'],
    STAGE2_COMMENT: ['photos', 'form002', 'avr', 'roads', 'plan', 'electronic'],
    TEXT_FIELDS: ['appNumber', 'engineerName', 'panelSerial', 'gsmLevel', 'rentalComment', 'stage1Comment', 'stage2Comment'],
    ALL_FORM: [
        'appNumber', 'engineerName', 'installDate', 'panelNumberAssigned',
        'panelSerial', 'gsmLevel', 'sensorPhoto', 'panicSignal', 'csmSignal',
        'instruction', 'arming', 'backup', 'ceilings', 'stage1Date',
        'stage1Inspector', 'stage1Comment', 'rental', 'sticker', 'photos',
        'form002', 'avr', 'defect', 'roads', 'plan', 'fireAlarm',
        'electronic', 'issues', 'incomplete', 'rentalComment',
        'fireAlarmChecklist', 'stage2Date', 'stage2Inspector', 'stage2Comment'
    ]
};

// Состояние приложения
App.state = {
    applications: [],
    allApplications: [],
    currentApp: null,
    stompClient: null,
    currentUser: document.querySelector('meta[name="username"]')?.content || 'guest',
    currentFilter: 'all',
    currentSearchQuery: '',
    currentSearchDate: '',
    searchResults: [],

    // Комментарии
    autoCommentsStage1: [],
    autoCommentsStage2: [],
    manualCommentStage1: '',
    manualCommentStage2: '',
    commentsInitialized: false,

    // Чат
    chatVisible: false,
    unreadMessages: 0,
    shouldAutoScrollChat: true,

    // Подписки
    activeSubscriptions: new Map(),
    currentlyLockedApplicationId: null,
    applicationViewers: new Map(),

    // Режимы
    followMode: false,
    followingUser: null,

    // Таймеры
    fieldChangeTimer: null
};