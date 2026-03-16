package com.corpcheck.check.model.enums;

public enum FireAlarmChecklistStatus {
    YES("Да", "Чек-лист заполнен"),
    NO("Нет", "Чек-лист отсутствует"),
    GOS_MONTAZH("Монтаж ГОС", "Монтаж инженером ГОС");

    private final String displayName;
    private final String description;

    FireAlarmChecklistStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public String getCssClass() {
        switch (this) {
            case YES: return "bg-success";
            case NO: return "bg-danger";
            case GOS_MONTAZH: return "bg-info";
            default: return "bg-secondary";
        }
    }

    public String getIcon() {
        switch (this) {
            case YES: return "bi-check-circle";
            case NO: return "bi-x-circle";
            case GOS_MONTAZH: return "bi-building";
            default: return "bi-question-circle";
        }
    }

    public boolean requiresAction() {
        return this != YES;
    }
}