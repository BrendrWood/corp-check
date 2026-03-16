package com.corpcheck.check.model.enums;

public enum ApplicationStatus {
    DRAFT("Черновик", "Заявка создана, ожидает заполнения"),
    STAGE1_PENDING("Ожидает ОП1", "Ожидает проверки сигналов (ОП1)"),
    STAGE1_COMPLETED("ОП1 пройден", "Проверка сигналов выполнена успешно"),
    STAGE1_FAILED("ОП1 не пройден", "Проверка сигналов выявила нарушения"),
    STAGE2_PENDING("Ожидает ОП2", "Ожидает проверки документов (ОП2)"),
    STAGE2_COMPLETED("ОП2 пройден", "Проверка документов выполнена успешно"),
    STAGE2_FAILED("ОП2 не пройден", "Проверка документов выявила нарушения"),
    REJECTED("Отклонено", "Заявка отклонена"),
    COMPLETED("Завершено", "Все проверки пройдены успешно");

    private final String displayName;
    private final String description;

    ApplicationStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean canProgressToNext() {
        return this == STAGE1_COMPLETED || this == STAGE2_PENDING;
    }

    public boolean isFinal() {
        return this == COMPLETED || this == REJECTED;
    }

    public ApplicationStatus next() {
        switch (this) {
            case DRAFT: return STAGE1_PENDING;
            case STAGE1_PENDING: return STAGE1_COMPLETED;
            case STAGE1_COMPLETED: return STAGE2_PENDING;
            case STAGE2_PENDING: return STAGE2_COMPLETED;
            case STAGE2_COMPLETED: return COMPLETED;
            default: return this;
        }
    }
}