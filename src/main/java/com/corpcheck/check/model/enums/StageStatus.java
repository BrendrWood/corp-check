package com.corpcheck.check.model.enums;

public enum StageStatus {
    OK("Пройден", "Проверка пройдена успешно"),
    NOK("Не пройден", "Обнаружены нарушения");

    private final String displayName;
    private final String description;

    StageStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isSuccessful() {
        return this == OK;
    }

    public String getCssClass() {
        return this == OK ? "bg-success" : "bg-danger";
    }

    public String getIcon() {
        return this == OK ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill";
    }
}