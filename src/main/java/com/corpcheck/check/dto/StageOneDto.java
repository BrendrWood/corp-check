package com.corpcheck.check.dto;

import com.corpcheck.check.model.enums.StageStatus;
import java.time.LocalDate;

public class StageOneDto {
    private Long id;
    private String gsmLevel;
    private String sensorConnectionPhoto; // "true", "false", "wired"
    private boolean panicSignalType;
    private boolean csmPanicSignal;
    private boolean instructionSticker;
    private boolean armingDisarming;
    private boolean backupPower;
    private boolean highCeilings;
    private LocalDate checkDate;
    private String inspector;
    private String comments;
    private StageStatus status;
    private int completedItems;
    private int totalItems;

    public StageOneDto() {
    }

    public StageOneDto(Long id, String gsmLevel, String sensorConnectionPhoto,
                       boolean panicSignalType, boolean csmPanicSignal,
                       boolean instructionSticker, boolean armingDisarming,
                       boolean backupPower, boolean highCeilings, LocalDate checkDate,
                       String inspector, String comments, StageStatus status,
                       int completedItems, int totalItems) {
        this.id = id;
        this.gsmLevel = gsmLevel;
        this.sensorConnectionPhoto = sensorConnectionPhoto;
        this.panicSignalType = panicSignalType;
        this.csmPanicSignal = csmPanicSignal;
        this.instructionSticker = instructionSticker;
        this.armingDisarming = armingDisarming;
        this.backupPower = backupPower;
        this.highCeilings = highCeilings;
        this.checkDate = checkDate;
        this.inspector = inspector;
        this.comments = comments;
        this.status = status;
        this.completedItems = completedItems;
        this.totalItems = totalItems;
    }

    // =============== GETTERS ===============

    public Long getId() {
        return id;
    }

    public String getGsmLevel() {
        return gsmLevel;
    }

    public String getSensorConnectionPhoto() {
        return sensorConnectionPhoto;
    }

    public boolean isPanicSignalType() {
        return panicSignalType;
    }

    public boolean isCsmPanicSignal() {
        return csmPanicSignal;
    }

    public boolean isInstructionSticker() {
        return instructionSticker;
    }

    public boolean isArmingDisarming() {
        return armingDisarming;
    }

    public boolean isBackupPower() {
        return backupPower;
    }

    public boolean isHighCeilings() {
        return highCeilings;
    }

    public LocalDate getCheckDate() {
        return checkDate;
    }

    public String getInspector() {
        return inspector;
    }

    public String getComments() {
        return comments;
    }

    public StageStatus getStatus() {
        return status;
    }

    public int getCompletedItems() {
        return completedItems;
    }

    public int getTotalItems() {
        return totalItems;
    }

    // =============== SETTERS ===============

    public void setId(Long id) {
        this.id = id;
    }

    public void setGsmLevel(String gsmLevel) {
        this.gsmLevel = gsmLevel;
    }

    public void setSensorConnectionPhoto(String sensorConnectionPhoto) {
        this.sensorConnectionPhoto = sensorConnectionPhoto;
    }

    public void setPanicSignalType(boolean panicSignalType) {
        this.panicSignalType = panicSignalType;
    }

    public void setCsmPanicSignal(boolean csmPanicSignal) {
        this.csmPanicSignal = csmPanicSignal;
    }

    public void setInstructionSticker(boolean instructionSticker) {
        this.instructionSticker = instructionSticker;
    }

    public void setArmingDisarming(boolean armingDisarming) {
        this.armingDisarming = armingDisarming;
    }

    public void setBackupPower(boolean backupPower) {
        this.backupPower = backupPower;
    }

    public void setHighCeilings(boolean highCeilings) {
        this.highCeilings = highCeilings;
    }

    public void setCheckDate(LocalDate checkDate) {
        this.checkDate = checkDate;
    }

    public void setInspector(String inspector) {
        this.inspector = inspector;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public void setStatus(StageStatus status) {
        this.status = status;
    }

    public void setCompletedItems(int completedItems) {
        this.completedItems = completedItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    // =============== BUSINESS METHODS ===============

    public double getProgressPercentage() {
        if (totalItems == 0) return 0;
        return (completedItems * 100.0) / totalItems;
    }

    public String getSensorConnectionPhotoDisplay() {
        if (sensorConnectionPhoto == null) return "";
        switch (sensorConnectionPhoto) {
            case "true":
                return "✅ Да";
            case "false":
                return "❌ Нет";
            case "wired":
                return "📞 Проводная";
            default:
                return sensorConnectionPhoto;
        }
    }

    public String getSensorConnectionPhotoClass() {
        if (sensorConnectionPhoto == null) return "";
        switch (sensorConnectionPhoto) {
            case "true":
                return "value-yes";
            case "false":
                return "value-no";
            case "wired":
                return "value-wired";
            default:
                return "";
        }
    }

    public boolean isSensorConnectionPhotoTrue() {
        return "true".equals(sensorConnectionPhoto);
    }

    public boolean isSensorConnectionPhotoFalse() {
        return "false".equals(sensorConnectionPhoto);
    }

    public boolean isSensorConnectionPhotoWired() {
        return "wired".equals(sensorConnectionPhoto);
    }
}