package com.corpcheck.check.dto;

import com.corpcheck.check.model.enums.FireAlarmChecklistStatus;
import com.corpcheck.check.model.enums.StageStatus;
import java.time.LocalDate;

public class StageTwoDto {
    private Long id;
    private boolean equipmentRental;
    private String rentalComment;
    private boolean stickersStandard;
    private boolean systemPhotos;
    private boolean form002Filled;
    private boolean accessRoads;
    private boolean floorPlan;
    private boolean fireAlarm;
    private FireAlarmChecklistStatus fireAlarmChecklist;
    private boolean acceptanceCertificate;
    private boolean defectAct;
    private boolean electronicChecklist;
    private boolean postInstallationIssues;
    private boolean incompleteForm002;
    private LocalDate checkDate;
    private String inspector;
    private String comments;
    private StageStatus status;
    private int completedItems;
    private int totalItems;

    public StageTwoDto() {
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public boolean isEquipmentRental() { return equipmentRental; }
    public void setEquipmentRental(boolean equipmentRental) { this.equipmentRental = equipmentRental; }

    public String getRentalComment() { return rentalComment; }
    public void setRentalComment(String rentalComment) { this.rentalComment = rentalComment; }

    public boolean isStickersStandard() { return stickersStandard; }
    public void setStickersStandard(boolean stickersStandard) { this.stickersStandard = stickersStandard; }

    public boolean isSystemPhotos() { return systemPhotos; }
    public void setSystemPhotos(boolean systemPhotos) { this.systemPhotos = systemPhotos; }

    public boolean isForm002Filled() { return form002Filled; }
    public void setForm002Filled(boolean form002Filled) { this.form002Filled = form002Filled; }

    public boolean isAccessRoads() { return accessRoads; }
    public void setAccessRoads(boolean accessRoads) { this.accessRoads = accessRoads; }

    public boolean isFloorPlan() { return floorPlan; }
    public void setFloorPlan(boolean floorPlan) { this.floorPlan = floorPlan; }

    public boolean isFireAlarm() { return fireAlarm; }
    public void setFireAlarm(boolean fireAlarm) { this.fireAlarm = fireAlarm; }

    public FireAlarmChecklistStatus getFireAlarmChecklist() { return fireAlarmChecklist; }
    public void setFireAlarmChecklist(FireAlarmChecklistStatus fireAlarmChecklist) { this.fireAlarmChecklist = fireAlarmChecklist; }

    public boolean isAcceptanceCertificate() { return acceptanceCertificate; }
    public void setAcceptanceCertificate(boolean acceptanceCertificate) { this.acceptanceCertificate = acceptanceCertificate; }

    public boolean isDefectAct() { return defectAct; }
    public void setDefectAct(boolean defectAct) { this.defectAct = defectAct; }

    public boolean isElectronicChecklist() { return electronicChecklist; }
    public void setElectronicChecklist(boolean electronicChecklist) { this.electronicChecklist = electronicChecklist; }

    public boolean isPostInstallationIssues() { return postInstallationIssues; }
    public void setPostInstallationIssues(boolean postInstallationIssues) { this.postInstallationIssues = postInstallationIssues; }

    public boolean isIncompleteForm002() { return incompleteForm002; }
    public void setIncompleteForm002(boolean incompleteForm002) { this.incompleteForm002 = incompleteForm002; }

    public LocalDate getCheckDate() { return checkDate; }
    public void setCheckDate(LocalDate checkDate) { this.checkDate = checkDate; }

    public String getInspector() { return inspector; }
    public void setInspector(String inspector) { this.inspector = inspector; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public StageStatus getStatus() { return status; }
    public void setStatus(StageStatus status) { this.status = status; }

    public int getCompletedItems() { return completedItems; }
    public void setCompletedItems(int completedItems) { this.completedItems = completedItems; }

    public int getTotalItems() { return totalItems; }
    public void setTotalItems(int totalItems) { this.totalItems = totalItems; }

    public double getProgressPercentage() {
        if (totalItems == 0) return 0;
        return (completedItems * 100.0) / totalItems;
    }

    public boolean requiresRentalComment() {
        return equipmentRental && (rentalComment == null || rentalComment.trim().isEmpty());
    }

    public boolean requiresFireAlarmChecklist() {
        return fireAlarm && fireAlarmChecklist == null;
    }
}