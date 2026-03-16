package com.corpcheck.check.util;

import com.corpcheck.check.dto.*;
import com.corpcheck.check.model.CorporateApplication;
import com.corpcheck.check.model.StageOneCheck;
import com.corpcheck.check.model.StageTwoCheck;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    // =============== В DTO ===============

    public ApplicationSummaryDto toSummaryDto(CorporateApplication app) {
        if (app == null) return null;

        ApplicationSummaryDto dto = new ApplicationSummaryDto();

        // Основная информация
        dto.setId(app.getId());
        dto.setApplicationNumber(app.getApplicationNumber());
        dto.setEngineerName(app.getEngineerName());
        dto.setPanelSerial(app.getPanelSerial());
        dto.setPanelNumberAssigned(app.isPanelNumberAssigned());
        dto.setInstallationDate(app.getInstallationDate());
        dto.setComments(app.getComments());

        // Данные первого этапа
        if (app.getStageOne() != null) {
            StageOneCheck s1 = app.getStageOne();
            dto.setStage1Status(s1.getStatus());
            dto.setStage1GsmLevel(s1.getGsmLevel());
            dto.setStage1SensorConnectionPhoto(s1.getSensorConnectionPhoto());
            dto.setStage1PanicSignalType(s1.isPanicSignalType()); // теперь Boolean принимает boolean
            dto.setStage1CsmPanicSignal(s1.isCsmPanicSignal());
            dto.setStage1InstructionSticker(s1.isInstructionSticker());
            dto.setStage1ArmingDisarming(s1.isArmingDisarming());
            dto.setStage1BackupPower(s1.isBackupPower());
            dto.setStage1HighCeilings(s1.isHighCeilings());
            dto.setStage1CheckDate(s1.getCheckDate());
            dto.setStage1Inspector(s1.getInspector());
            dto.setStage1Comments(s1.getComments());
        }

        // Данные второго этапа
        if (app.getStageTwo() != null) {
            StageTwoCheck s2 = app.getStageTwo();
            dto.setStage2Status(s2.getStatus());
            dto.setStage2EquipmentRental(s2.isEquipmentRental());
            dto.setStage2RentalComment(s2.getRentalComment());
            dto.setStage2StickersStandard(s2.isStickersStandard());
            dto.setStage2SystemPhotos(s2.isSystemPhotos());
            dto.setStage2Form002Filled(s2.isForm002Filled());
            dto.setStage2AccessRoads(s2.isAccessRoads());
            dto.setStage2FloorPlan(s2.isFloorPlan());
            dto.setStage2FireAlarm(s2.isFireAlarm());
            dto.setStage2FireAlarmChecklist(s2.getFireAlarmChecklist() != null ?
                    s2.getFireAlarmChecklist().toString() : null);
            dto.setStage2AcceptanceCertificate(s2.isAcceptanceCertificate());
            dto.setStage2DefectAct(s2.isDefectAct());
            dto.setStage2ElectronicChecklist(s2.isElectronicChecklist());
            dto.setStage2PostInstallationIssues(s2.isPostInstallationIssues());
            dto.setStage2IncompleteForm002(s2.isIncompleteForm002());
            dto.setStage2CheckDate(s2.getCheckDate());
            dto.setStage2Inspector(s2.getInspector());
            dto.setStage2Comments(s2.getComments());
        }

        dto.setOverallStatus(app.getStatus());
        dto.setLastUpdated(app.getLastUpdated());

        return dto;
    }

    public ApplicationDetailDto toDetailDto(CorporateApplication app) {
        if (app == null) return null;

        ApplicationDetailDto dto = new ApplicationDetailDto();
        dto.setId(app.getId());
        dto.setApplicationNumber(app.getApplicationNumber());
        dto.setEngineerName(app.getEngineerName());
        dto.setPanelSerial(app.getPanelSerial());
        dto.setPanelNumberAssigned(app.isPanelNumberAssigned());
        dto.setInstallationDate(app.getInstallationDate());
        dto.setStageOne(toStageOneDto(app.getStageOne()));
        dto.setStageTwo(toStageTwoDto(app.getStageTwo()));
        dto.setStatus(app.getStatus());
        dto.setComments(app.getComments());
        dto.setCreatedAt(app.getCreatedAt());
        dto.setLastUpdated(app.getLastUpdated());
        dto.setCreatedBy(app.getCreatedBy());
        dto.setUpdatedBy(app.getUpdatedBy());
        dto.setCanEditStage1(app.canEditStage1());
        dto.setCanEditStage2(app.canEditStage2());

        return dto;
    }

    public StageOneDto toStageOneDto(StageOneCheck stage) {
        if (stage == null) return null;

        StageOneDto dto = new StageOneDto();
        dto.setId(stage.getId());
        dto.setGsmLevel(stage.getGsmLevel());
        dto.setSensorConnectionPhoto(stage.getSensorConnectionPhoto());
        dto.setPanicSignalType(stage.isPanicSignalType());
        dto.setCsmPanicSignal(stage.isCsmPanicSignal());
        dto.setInstructionSticker(stage.isInstructionSticker());
        dto.setArmingDisarming(stage.isArmingDisarming());
        dto.setBackupPower(stage.isBackupPower());
        dto.setHighCeilings(stage.isHighCeilings());
        dto.setCheckDate(stage.getCheckDate());
        dto.setInspector(stage.getInspector());
        dto.setComments(stage.getComments());
        dto.setStatus(stage.getStatus());
        dto.setCompletedItems(stage.getCompletedItemsCount());
        dto.setTotalItems(stage.getTotalItemsCount());

        return dto;
    }

    public StageTwoDto toStageTwoDto(StageTwoCheck stage) {
        if (stage == null) return null;

        StageTwoDto dto = new StageTwoDto();
        dto.setId(stage.getId());
        dto.setEquipmentRental(stage.isEquipmentRental());
        dto.setRentalComment(stage.getRentalComment());
        dto.setStickersStandard(stage.isStickersStandard());
        dto.setSystemPhotos(stage.isSystemPhotos());
        dto.setForm002Filled(stage.isForm002Filled());
        dto.setAccessRoads(stage.isAccessRoads());
        dto.setFloorPlan(stage.isFloorPlan());
        dto.setFireAlarm(stage.isFireAlarm());
        dto.setFireAlarmChecklist(stage.getFireAlarmChecklist());
        dto.setAcceptanceCertificate(stage.isAcceptanceCertificate());
        dto.setDefectAct(stage.isDefectAct());
        dto.setElectronicChecklist(stage.isElectronicChecklist());
        dto.setPostInstallationIssues(stage.isPostInstallationIssues());
        dto.setIncompleteForm002(stage.isIncompleteForm002());
        dto.setCheckDate(stage.getCheckDate());
        dto.setInspector(stage.getInspector());
        dto.setComments(stage.getComments());
        dto.setStatus(stage.getStatus());
        dto.setCompletedItems(stage.getCompletedItemsCount());
        dto.setTotalItems(stage.getTotalItemsCount());

        return dto;
    }

    // =============== ИЗ DTO ===============

    public CorporateApplication toEntity(ApplicationDetailDto dto) {
        if (dto == null) return null;

        CorporateApplication app = new CorporateApplication();
        app.setApplicationNumber(dto.getApplicationNumber());
        app.setEngineerName(dto.getEngineerName());
        app.setPanelSerial(dto.getPanelSerial());
        app.setPanelNumberAssigned(dto.isPanelNumberAssigned());
        app.setInstallationDate(dto.getInstallationDate());
        app.setComments(dto.getComments());
        return app;
    }

    public void updateEntityFromDto(CorporateApplication app, ApplicationDetailDto dto) {
        if (dto.getApplicationNumber() != null)
            app.setApplicationNumber(dto.getApplicationNumber());
        if (dto.getEngineerName() != null)
            app.setEngineerName(dto.getEngineerName());
        if (dto.getPanelSerial() != null)
            app.setPanelSerial(dto.getPanelSerial());
        app.setPanelNumberAssigned(dto.isPanelNumberAssigned());
        if (dto.getInstallationDate() != null)
            app.setInstallationDate(dto.getInstallationDate());
        if (dto.getComments() != null)
            app.setComments(dto.getComments());
    }
}