package com.corpcheck.check.model;

import com.corpcheck.check.model.enums.StageStatus;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "stage_one_checks")
public class StageOneCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gsm_level", length = 20)
    private String gsmLevel;

    @Column(name = "sensor_connection_photo", length = 20)
    private String sensorConnectionPhoto; // "true", "false", "wired"

    @Column(name = "panic_signal_type")
    private boolean panicSignalType; // true = есть сигнал, false = нет сигнала

    @Column(name = "csm_panic_signal")
    private boolean csmPanicSignal;

    @Column(name = "instruction_sticker")
    private boolean instructionSticker;

    @Column(name = "arming_disarming")
    private boolean armingDisarming;

    @Column(name = "backup_power")
    private boolean backupPower;

    @Column(name = "high_ceilings")
    private boolean highCeilings;

    @Column(name = "check_date")
    private LocalDate checkDate;

    @Column(length = 100)
    private String inspector;

    @Column(length = 2000)
    private String comments;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private StageStatus status;

    // =============== CONSTRUCTORS ===============

    public StageOneCheck() {
    }

    public StageOneCheck(Long id, String gsmLevel, String sensorConnectionPhoto,
                         boolean panicSignalType, boolean csmPanicSignal,
                         boolean instructionSticker, boolean armingDisarming,
                         boolean backupPower, boolean highCeilings, LocalDate checkDate,
                         String inspector, String comments, StageStatus status) {
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

    // =============== BUSINESS METHODS ===============

    public boolean isComplete() {
        return gsmLevel != null && !gsmLevel.trim().isEmpty() &&
                inspector != null && !inspector.trim().isEmpty() &&
                checkDate != null &&
                status != null;
    }

    public int getCompletedItemsCount() {
        int count = 0;
        if (gsmLevel != null && !gsmLevel.trim().isEmpty()) count++;
        if (sensorConnectionPhoto != null && !sensorConnectionPhoto.trim().isEmpty()) count++;
        count++; // panicSignalType всегда считаем (либо true, либо false)
        if (csmPanicSignal) count++;
        if (instructionSticker) count++;
        if (armingDisarming) count++;
        if (backupPower) count++;
        if (highCeilings) count++;
        return count;
    }

    public int getTotalItemsCount() {
        return 8;
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
}