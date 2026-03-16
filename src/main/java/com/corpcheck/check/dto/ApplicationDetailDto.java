package com.corpcheck.check.dto;

import com.corpcheck.check.model.enums.ApplicationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ApplicationDetailDto {
    private Long id;
    private String applicationNumber;
    private String engineerName;
    private String panelSerial;
    private boolean panelNumberAssigned;
    private LocalDate installationDate;
    private StageOneDto stageOne;
    private StageTwoDto stageTwo;
    private ApplicationStatus status;
    private String comments;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    private String createdBy;
    private String updatedBy;
    private boolean canEditStage1;
    private boolean canEditStage2;
    private String currentLockOwner;

    public ApplicationDetailDto() {
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }

    public String getEngineerName() { return engineerName; }
    public void setEngineerName(String engineerName) { this.engineerName = engineerName; }

    public String getPanelSerial() { return panelSerial; }
    public void setPanelSerial(String panelSerial) { this.panelSerial = panelSerial; }

    public boolean isPanelNumberAssigned() { return panelNumberAssigned; }
    public void setPanelNumberAssigned(boolean panelNumberAssigned) { this.panelNumberAssigned = panelNumberAssigned; }

    public LocalDate getInstallationDate() { return installationDate; }
    public void setInstallationDate(LocalDate installationDate) { this.installationDate = installationDate; }

    public StageOneDto getStageOne() { return stageOne; }
    public void setStageOne(StageOneDto stageOne) { this.stageOne = stageOne; }

    public StageTwoDto getStageTwo() { return stageTwo; }
    public void setStageTwo(StageTwoDto stageTwo) { this.stageTwo = stageTwo; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    public boolean isCanEditStage1() { return canEditStage1; }
    public void setCanEditStage1(boolean canEditStage1) { this.canEditStage1 = canEditStage1; }

    public boolean isCanEditStage2() { return canEditStage2; }
    public void setCanEditStage2(boolean canEditStage2) { this.canEditStage2 = canEditStage2; }

    public String getCurrentLockOwner() { return currentLockOwner; }
    public void setCurrentLockOwner(String currentLockOwner) { this.currentLockOwner = currentLockOwner; }
}