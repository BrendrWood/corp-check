package com.corpcheck.check.model;

import com.corpcheck.check.model.enums.FireAlarmChecklistStatus;
import com.corpcheck.check.model.enums.StageStatus;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "stage_two_checks")
public class StageTwoCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "equipment_rental")
    private boolean equipmentRental;

    @Column(name = "rental_comment", length = 500)
    private String rentalComment;

    @Column(name = "stickers_standard")
    private boolean stickersStandard;

    @Column(name = "system_photos")
    private boolean systemPhotos;

    @Column(name = "form_002_filled")
    private boolean form002Filled;

    @Column(name = "access_roads")
    private boolean accessRoads;

    @Column(name = "floor_plan")
    private boolean floorPlan;

    @Column(name = "fire_alarm")
    private boolean fireAlarm;

    @Enumerated(EnumType.STRING)
    @Column(name = "fire_alarm_checklist", length = 20)
    private FireAlarmChecklistStatus fireAlarmChecklist;

    @Column(name = "acceptance_certificate")
    private boolean acceptanceCertificate;

    @Column(name = "defect_act")
    private boolean defectAct;

    @Column(name = "electronic_checklist")
    private boolean electronicChecklist;

    @Column(name = "post_installation_issues")
    private boolean postInstallationIssues;

    @Column(name = "incomplete_form_002")
    private boolean incompleteForm002;

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

    public StageTwoCheck() {
    }

    // =============== GETTERS ===============

    public Long getId() {
        return id;
    }

    public boolean isEquipmentRental() {
        return equipmentRental;
    }

    public String getRentalComment() {
        return rentalComment;
    }

    public boolean isStickersStandard() {
        return stickersStandard;
    }

    public boolean isSystemPhotos() {
        return systemPhotos;
    }

    public boolean isForm002Filled() {
        return form002Filled;
    }

    public boolean isAccessRoads() {
        return accessRoads;
    }

    public boolean isFloorPlan() {
        return floorPlan;
    }

    public boolean isFireAlarm() {
        return fireAlarm;
    }

    public FireAlarmChecklistStatus getFireAlarmChecklist() {
        return fireAlarmChecklist;
    }

    public boolean isAcceptanceCertificate() {
        return acceptanceCertificate;
    }

    public boolean isDefectAct() {
        return defectAct;
    }

    public boolean isElectronicChecklist() {
        return electronicChecklist;
    }

    public boolean isPostInstallationIssues() {
        return postInstallationIssues;
    }

    public boolean isIncompleteForm002() {
        return incompleteForm002;
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

    public void setEquipmentRental(boolean equipmentRental) {
        this.equipmentRental = equipmentRental;
    }

    public void setRentalComment(String rentalComment) {
        this.rentalComment = rentalComment;
    }

    public void setStickersStandard(boolean stickersStandard) {
        this.stickersStandard = stickersStandard;
    }

    public void setSystemPhotos(boolean systemPhotos) {
        this.systemPhotos = systemPhotos;
    }

    public void setForm002Filled(boolean form002Filled) {
        this.form002Filled = form002Filled;
    }

    public void setAccessRoads(boolean accessRoads) {
        this.accessRoads = accessRoads;
    }

    public void setFloorPlan(boolean floorPlan) {
        this.floorPlan = floorPlan;
    }

    public void setFireAlarm(boolean fireAlarm) {
        this.fireAlarm = fireAlarm;
    }

    public void setFireAlarmChecklist(FireAlarmChecklistStatus fireAlarmChecklist) {
        this.fireAlarmChecklist = fireAlarmChecklist;
    }

    public void setAcceptanceCertificate(boolean acceptanceCertificate) {
        this.acceptanceCertificate = acceptanceCertificate;
    }

    public void setDefectAct(boolean defectAct) {
        this.defectAct = defectAct;
    }

    public void setElectronicChecklist(boolean electronicChecklist) {
        this.electronicChecklist = electronicChecklist;
    }

    public void setPostInstallationIssues(boolean postInstallationIssues) {
        this.postInstallationIssues = postInstallationIssues;
    }

    public void setIncompleteForm002(boolean incompleteForm002) {
        this.incompleteForm002 = incompleteForm002;
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
        if (inspector == null || inspector.trim().isEmpty()) return false;
        if (checkDate == null) return false;
        if (status == null) return false;

        if (equipmentRental && (rentalComment == null || rentalComment.trim().isEmpty())) {
            return false;
        }

        if (fireAlarm && fireAlarmChecklist == null) {
            return false;
        }

        return true;
    }

    public int getCompletedItemsCount() {
        int count = 0;
        if (stickersStandard) count++;
        if (systemPhotos) count++;
        if (form002Filled) count++;
        if (accessRoads) count++;
        if (floorPlan) count++;
        if (acceptanceCertificate) count++;
        if (defectAct) count++;
        if (electronicChecklist) count++;
        if (!postInstallationIssues) count++;
        if (!incompleteForm002) count++;
        return count;
    }

    public int getTotalItemsCount() {
        return 10;
    }
}