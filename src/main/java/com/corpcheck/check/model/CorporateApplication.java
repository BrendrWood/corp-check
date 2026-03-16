package com.corpcheck.check.model;

import com.corpcheck.check.model.enums.ApplicationStatus;
import com.corpcheck.check.model.enums.StageStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "corporate_applications",
        uniqueConstraints = @UniqueConstraint(columnNames = "application_number"),
        indexes = {
                @Index(name = "idx_app_number", columnList = "application_number"),
                @Index(name = "idx_engineer_name", columnList = "engineer_name"),
                @Index(name = "idx_installation_date", columnList = "installation_date"),
                @Index(name = "idx_last_updated", columnList = "last_updated DESC"),
                @Index(name = "idx_application_status", columnList = "status")
        })
public class CorporateApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_number", nullable = false, unique = true, length = 50)
    private String applicationNumber;

    @Column(name = "engineer_name", length = 100)
    private String engineerName;

    @Column(name = "panel_serial", length = 100)
    private String panelSerial;

    @Column(name = "panel_number_assigned")
    private boolean panelNumberAssigned;

    @Column(name = "installation_date")
    private LocalDate installationDate;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_one_id")
    private StageOneCheck stageOne;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_two_id")
    private StageTwoCheck stageTwo;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @Column(length = 2000)
    private String comments;

    // =============== CONSTRUCTORS ===============

    public CorporateApplication() {
    }

    // =============== GETTERS ===============

    public Long getId() {
        return id;
    }

    public String getApplicationNumber() {
        return applicationNumber;
    }

    public String getEngineerName() {
        return engineerName;
    }

    public String getPanelSerial() {
        return panelSerial;
    }

    public boolean isPanelNumberAssigned() {
        return panelNumberAssigned;
    }

    public LocalDate getInstallationDate() {
        return installationDate;
    }

    public StageOneCheck getStageOne() {
        return stageOne;
    }

    public StageTwoCheck getStageTwo() {
        return stageTwo;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public String getComments() {
        return comments;
    }

    // =============== SETTERS ===============

    public void setId(Long id) {
        this.id = id;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public void setEngineerName(String engineerName) {
        this.engineerName = engineerName;
    }

    public void setPanelSerial(String panelSerial) {
        this.panelSerial = panelSerial;
    }

    public void setPanelNumberAssigned(boolean panelNumberAssigned) {
        this.panelNumberAssigned = panelNumberAssigned;
    }

    public void setInstallationDate(LocalDate installationDate) {
        this.installationDate = installationDate;
    }

    public void setStageOne(StageOneCheck stageOne) {
        this.stageOne = stageOne;
    }

    public void setStageTwo(StageTwoCheck stageTwo) {
        this.stageTwo = stageTwo;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    // =============== BUSINESS METHODS ===============

    @PrePersist
    protected void onCreate() {
        if (stageOne == null) {
            stageOne = new StageOneCheck();
        }
        if (stageTwo == null) {
            stageTwo = new StageTwoCheck();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    public boolean canEditStage1() {
        return status == ApplicationStatus.DRAFT ||
                status == ApplicationStatus.STAGE1_PENDING ||
                status == ApplicationStatus.STAGE1_COMPLETED;
    }

    public boolean canEditStage2() {
        return status == ApplicationStatus.STAGE1_COMPLETED ||
                status == ApplicationStatus.STAGE2_PENDING ||
                status == ApplicationStatus.STAGE2_COMPLETED;
    }

    public void progressToNextStage() {
        switch (status) {
            case DRAFT:
                status = ApplicationStatus.STAGE1_PENDING;
                break;
            case STAGE1_PENDING:
            case STAGE1_COMPLETED:
                if (stageOne != null && stageOne.getStatus() == StageStatus.OK) {
                    status = ApplicationStatus.STAGE2_PENDING;
                }
                break;
            case STAGE2_PENDING:
                if (stageTwo != null && stageTwo.getStatus() == StageStatus.OK) {
                    status = ApplicationStatus.STAGE2_COMPLETED;
                }
                break;
            default:
                break;
        }
    }
}