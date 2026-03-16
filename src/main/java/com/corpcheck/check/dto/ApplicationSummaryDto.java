package com.corpcheck.check.dto;

import com.corpcheck.check.model.enums.ApplicationStatus;
import com.corpcheck.check.model.enums.StageStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ApplicationSummaryDto {
    private Long id;
    private String applicationNumber;
    private String engineerName;
    private String panelSerial;
    private boolean panelNumberAssigned;
    private LocalDate installationDate;
    private String comments;

    // Данные первого этапа
    private StageStatus stage1Status;
    private String stage1GsmLevel;
    private String stage1SensorConnectionPhoto;
    private Boolean stage1PanicSignalType; // Изменено с String на Boolean
    private Boolean stage1CsmPanicSignal;
    private Boolean stage1InstructionSticker;
    private Boolean stage1ArmingDisarming;
    private Boolean stage1BackupPower;
    private Boolean stage1HighCeilings;
    private LocalDate stage1CheckDate;
    private String stage1Inspector;
    private String stage1Comments;

    // Данные второго этапа
    private StageStatus stage2Status;
    private Boolean stage2EquipmentRental;
    private String stage2RentalComment;
    private Boolean stage2StickersStandard;
    private Boolean stage2SystemPhotos;
    private Boolean stage2Form002Filled;
    private Boolean stage2AccessRoads;
    private Boolean stage2FloorPlan;
    private Boolean stage2FireAlarm;
    private String stage2FireAlarmChecklist;
    private Boolean stage2AcceptanceCertificate;
    private Boolean stage2DefectAct;
    private Boolean stage2ElectronicChecklist;
    private Boolean stage2PostInstallationIssues;
    private Boolean stage2IncompleteForm002;
    private LocalDate stage2CheckDate;
    private String stage2Inspector;
    private String stage2Comments;

    private ApplicationStatus overallStatus;
    private LocalDateTime lastUpdated;

    public ApplicationSummaryDto() {
    }

    // =============== GETTERS ===============

    public Long getId() { return id; }
    public String getApplicationNumber() { return applicationNumber; }
    public String getEngineerName() { return engineerName; }
    public String getPanelSerial() { return panelSerial; }
    public boolean isPanelNumberAssigned() { return panelNumberAssigned; }
    public LocalDate getInstallationDate() { return installationDate; }
    public String getComments() { return comments; }

    public StageStatus getStage1Status() { return stage1Status; }
    public String getStage1GsmLevel() { return stage1GsmLevel; }
    public String getStage1SensorConnectionPhoto() { return stage1SensorConnectionPhoto; }
    public Boolean getStage1PanicSignalType() { return stage1PanicSignalType; }
    public Boolean getStage1CsmPanicSignal() { return stage1CsmPanicSignal; }
    public Boolean getStage1InstructionSticker() { return stage1InstructionSticker; }
    public Boolean getStage1ArmingDisarming() { return stage1ArmingDisarming; }
    public Boolean getStage1BackupPower() { return stage1BackupPower; }
    public Boolean getStage1HighCeilings() { return stage1HighCeilings; }
    public LocalDate getStage1CheckDate() { return stage1CheckDate; }
    public String getStage1Inspector() { return stage1Inspector; }
    public String getStage1Comments() { return stage1Comments; }

    public StageStatus getStage2Status() { return stage2Status; }
    public Boolean getStage2EquipmentRental() { return stage2EquipmentRental; }
    public String getStage2RentalComment() { return stage2RentalComment; }
    public Boolean getStage2StickersStandard() { return stage2StickersStandard; }
    public Boolean getStage2SystemPhotos() { return stage2SystemPhotos; }
    public Boolean getStage2Form002Filled() { return stage2Form002Filled; }
    public Boolean getStage2AccessRoads() { return stage2AccessRoads; }
    public Boolean getStage2FloorPlan() { return stage2FloorPlan; }
    public Boolean getStage2FireAlarm() { return stage2FireAlarm; }
    public String getStage2FireAlarmChecklist() { return stage2FireAlarmChecklist; }
    public Boolean getStage2AcceptanceCertificate() { return stage2AcceptanceCertificate; }
    public Boolean getStage2DefectAct() { return stage2DefectAct; }
    public Boolean getStage2ElectronicChecklist() { return stage2ElectronicChecklist; }
    public Boolean getStage2PostInstallationIssues() { return stage2PostInstallationIssues; }
    public Boolean getStage2IncompleteForm002() { return stage2IncompleteForm002; }
    public LocalDate getStage2CheckDate() { return stage2CheckDate; }
    public String getStage2Inspector() { return stage2Inspector; }
    public String getStage2Comments() { return stage2Comments; }

    public ApplicationStatus getOverallStatus() { return overallStatus; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }

    // =============== SETTERS ===============

    public void setId(Long id) { this.id = id; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }
    public void setEngineerName(String engineerName) { this.engineerName = engineerName; }
    public void setPanelSerial(String panelSerial) { this.panelSerial = panelSerial; }
    public void setPanelNumberAssigned(boolean panelNumberAssigned) { this.panelNumberAssigned = panelNumberAssigned; }
    public void setInstallationDate(LocalDate installationDate) { this.installationDate = installationDate; }
    public void setComments(String comments) { this.comments = comments; }

    public void setStage1Status(StageStatus stage1Status) { this.stage1Status = stage1Status; }
    public void setStage1GsmLevel(String stage1GsmLevel) { this.stage1GsmLevel = stage1GsmLevel; }
    public void setStage1SensorConnectionPhoto(String stage1SensorConnectionPhoto) { this.stage1SensorConnectionPhoto = stage1SensorConnectionPhoto; }
    public void setStage1PanicSignalType(Boolean stage1PanicSignalType) { this.stage1PanicSignalType = stage1PanicSignalType; }
    public void setStage1CsmPanicSignal(Boolean stage1CsmPanicSignal) { this.stage1CsmPanicSignal = stage1CsmPanicSignal; }
    public void setStage1InstructionSticker(Boolean stage1InstructionSticker) { this.stage1InstructionSticker = stage1InstructionSticker; }
    public void setStage1ArmingDisarming(Boolean stage1ArmingDisarming) { this.stage1ArmingDisarming = stage1ArmingDisarming; }
    public void setStage1BackupPower(Boolean stage1BackupPower) { this.stage1BackupPower = stage1BackupPower; }
    public void setStage1HighCeilings(Boolean stage1HighCeilings) { this.stage1HighCeilings = stage1HighCeilings; }
    public void setStage1CheckDate(LocalDate stage1CheckDate) { this.stage1CheckDate = stage1CheckDate; }
    public void setStage1Inspector(String stage1Inspector) { this.stage1Inspector = stage1Inspector; }
    public void setStage1Comments(String stage1Comments) { this.stage1Comments = stage1Comments; }

    public void setStage2Status(StageStatus stage2Status) { this.stage2Status = stage2Status; }
    public void setStage2EquipmentRental(Boolean stage2EquipmentRental) { this.stage2EquipmentRental = stage2EquipmentRental; }
    public void setStage2RentalComment(String stage2RentalComment) { this.stage2RentalComment = stage2RentalComment; }
    public void setStage2StickersStandard(Boolean stage2StickersStandard) { this.stage2StickersStandard = stage2StickersStandard; }
    public void setStage2SystemPhotos(Boolean stage2SystemPhotos) { this.stage2SystemPhotos = stage2SystemPhotos; }
    public void setStage2Form002Filled(Boolean stage2Form002Filled) { this.stage2Form002Filled = stage2Form002Filled; }
    public void setStage2AccessRoads(Boolean stage2AccessRoads) { this.stage2AccessRoads = stage2AccessRoads; }
    public void setStage2FloorPlan(Boolean stage2FloorPlan) { this.stage2FloorPlan = stage2FloorPlan; }
    public void setStage2FireAlarm(Boolean stage2FireAlarm) { this.stage2FireAlarm = stage2FireAlarm; }
    public void setStage2FireAlarmChecklist(String stage2FireAlarmChecklist) { this.stage2FireAlarmChecklist = stage2FireAlarmChecklist; }
    public void setStage2AcceptanceCertificate(Boolean stage2AcceptanceCertificate) { this.stage2AcceptanceCertificate = stage2AcceptanceCertificate; }
    public void setStage2DefectAct(Boolean stage2DefectAct) { this.stage2DefectAct = stage2DefectAct; }
    public void setStage2ElectronicChecklist(Boolean stage2ElectronicChecklist) { this.stage2ElectronicChecklist = stage2ElectronicChecklist; }
    public void setStage2PostInstallationIssues(Boolean stage2PostInstallationIssues) { this.stage2PostInstallationIssues = stage2PostInstallationIssues; }
    public void setStage2IncompleteForm002(Boolean stage2IncompleteForm002) { this.stage2IncompleteForm002 = stage2IncompleteForm002; }
    public void setStage2CheckDate(LocalDate stage2CheckDate) { this.stage2CheckDate = stage2CheckDate; }
    public void setStage2Inspector(String stage2Inspector) { this.stage2Inspector = stage2Inspector; }
    public void setStage2Comments(String stage2Comments) { this.stage2Comments = stage2Comments; }

    public void setOverallStatus(ApplicationStatus overallStatus) { this.overallStatus = overallStatus; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    // =============== BUSINESS METHODS ===============

    public boolean isStage1Completed() {
        return stage1Status != null;
    }

    public boolean isStage2Completed() {
        return stage2Status != null;
    }

    public String getProgressColor() {
        if (stage2Status == StageStatus.OK) return "success";
        if (stage1Status == StageStatus.OK) return "primary";
        if (stage1Status == StageStatus.NOK) return "danger";
        return "secondary";
    }
}