package com.corpcheck.check.service;

import com.corpcheck.check.dto.ApplicationDetailDto;
import com.corpcheck.check.dto.ApplicationSummaryDto;
import com.corpcheck.check.dto.StageOneDto;
import com.corpcheck.check.dto.StageTwoDto;
import com.corpcheck.check.model.CorporateApplication;
import com.corpcheck.check.model.StageOneCheck;
import com.corpcheck.check.model.StageTwoCheck;
import com.corpcheck.check.model.enums.ApplicationStatus;
import com.corpcheck.check.model.enums.StageStatus;
import com.corpcheck.check.repository.CorporateApplicationRepository;
import com.corpcheck.check.repository.StageOneCheckRepository;
import com.corpcheck.check.repository.StageTwoCheckRepository;
import com.corpcheck.check.util.DtoMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CorporateApplicationService {

    private static final Logger log = LoggerFactory.getLogger(CorporateApplicationService.class);

    private final CorporateApplicationRepository applicationRepository;
    private final StageOneCheckRepository stageOneRepository;
    private final StageTwoCheckRepository stageTwoRepository;
    private final WebSocketSessionService sessionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final DtoMapper mapper;

    @Autowired
    public CorporateApplicationService(
            CorporateApplicationRepository applicationRepository,
            StageOneCheckRepository stageOneRepository,
            StageTwoCheckRepository stageTwoRepository,
            WebSocketSessionService sessionService,
            SimpMessagingTemplate messagingTemplate,
            DtoMapper mapper) {
        this.applicationRepository = applicationRepository;
        this.stageOneRepository = stageOneRepository;
        this.stageTwoRepository = stageTwoRepository;
        this.sessionService = sessionService;
        this.messagingTemplate = messagingTemplate;
        this.mapper = mapper;
    }

    // =============== БАЗОВЫЕ ОПЕРАЦИИ ===============

    @Transactional(readOnly = true)
    @Cacheable(value = "recentApplications", key = "'recent-' + #limit")
    public List<ApplicationSummaryDto> findRecent(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "lastUpdated"));
        return applicationRepository.findRecent(pageable)
                .stream()
                .map(mapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationDetailDto findById(Long id) {
        CorporateApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        ApplicationDetailDto dto = mapper.toDetailDto(app);

        dto.setCanEditStage1(sessionService.getLockOwner(String.valueOf(id), "stage1") == null);
        dto.setCanEditStage2(sessionService.getLockOwner(String.valueOf(id), "stage2") == null);
        dto.setCurrentLockOwner(sessionService.getLockOwner(String.valueOf(id), "stage1"));

        return dto;
    }

    @Transactional
    @CacheEvict(value = "recentApplications", allEntries = true)
    public ApplicationDetailDto createApplication(ApplicationDetailDto dto, String username) {
        if (applicationRepository.existsByApplicationNumber(dto.getApplicationNumber())) {
            throw new RuntimeException("Application number already exists: " + dto.getApplicationNumber());
        }

        CorporateApplication app = new CorporateApplication();

        // Общая информация
        app.setApplicationNumber(dto.getApplicationNumber());
        app.setEngineerName(dto.getEngineerName());
        app.setPanelSerial(dto.getPanelSerial());
        app.setPanelNumberAssigned(dto.isPanelNumberAssigned());
        app.setInstallationDate(dto.getInstallationDate());
        app.setComments(dto.getComments());

        app.setCreatedBy(username);
        app.setUpdatedBy(username);
        app.setStatus(ApplicationStatus.DRAFT);

        // Этап 1
        StageOneCheck stageOne = new StageOneCheck();
        if (dto.getStageOne() != null) {
            updateStageOneEntity(stageOne, dto.getStageOne());
        }
        app.setStageOne(stageOne);

        // Этап 2
        StageTwoCheck stageTwo = new StageTwoCheck();
        if (dto.getStageTwo() != null) {
            updateStageTwoEntity(stageTwo, dto.getStageTwo());
        }
        app.setStageTwo(stageTwo);

        CorporateApplication saved = applicationRepository.save(app);
        log.info("Application created: {} by {}", saved.getApplicationNumber(), username);

        return mapper.toDetailDto(saved);
    }

    @Transactional
    @CacheEvict(value = "recentApplications", allEntries = true)
    public ApplicationDetailDto updateApplication(Long id, ApplicationDetailDto dto, String username) {
        log.info("Updating application {} by {}", id, username);

        CorporateApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        // Обновляем общую информацию
        app.setApplicationNumber(dto.getApplicationNumber());
        app.setEngineerName(dto.getEngineerName());
        app.setPanelSerial(dto.getPanelSerial());
        app.setPanelNumberAssigned(dto.isPanelNumberAssigned());
        app.setInstallationDate(dto.getInstallationDate());
        app.setComments(dto.getComments());
        app.setUpdatedBy(username);

        // Обновляем этап 1
        StageOneCheck stageOne = app.getStageOne();
        if (stageOne == null) {
            stageOne = new StageOneCheck();
            app.setStageOne(stageOne);
        }
        if (dto.getStageOne() != null) {
            updateStageOneEntity(stageOne, dto.getStageOne());
            updateApplicationStatusFromStage1(app, dto.getStageOne().getStatus());
        }

        // Обновляем этап 2
        StageTwoCheck stageTwo = app.getStageTwo();
        if (stageTwo == null) {
            stageTwo = new StageTwoCheck();
            app.setStageTwo(stageTwo);
        }
        if (dto.getStageTwo() != null) {
            updateStageTwoEntity(stageTwo, dto.getStageTwo());
            updateApplicationStatusFromStage2(app, dto.getStageTwo().getStatus());
        }

        CorporateApplication saved = applicationRepository.save(app);
        log.info("Application updated: {} by {}", saved.getApplicationNumber(), username);

        return mapper.toDetailDto(saved);
    }

    @Transactional
    @CacheEvict(value = "recentApplications", allEntries = true)
    public void deleteApplication(Long id, String username) {
        log.info("Deleting application {} by {}", id, username);

        CorporateApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        try {
            applicationRepository.delete(app);
            log.info("Application deleted: {} by {}", app.getApplicationNumber(), username);
        } catch (Exception e) {
            log.error("Error deleting application: {}", e.getMessage());
            throw new RuntimeException("Ошибка при удалении заявки: " + e.getMessage());
        }
    }

    // =============== ОБНОВЛЕНИЕ ОТДЕЛЬНЫХ ЭТАПОВ ===============

    @Transactional
    public ApplicationDetailDto updateStage1(Long id, StageOneDto stageOneDto, String username) {
        CorporateApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        StageOneCheck stageOne = app.getStageOne();
        if (stageOne == null) {
            stageOne = new StageOneCheck();
            app.setStageOne(stageOne);
        }

        updateStageOneEntity(stageOne, stageOneDto);
        updateApplicationStatusFromStage1(app, stageOneDto.getStatus());

        app.setUpdatedBy(username);
        CorporateApplication saved = applicationRepository.save(app);

        log.info("Stage 1 updated for application {} by {}", id, username);

        return mapper.toDetailDto(saved);
    }

    @Transactional
    public ApplicationDetailDto updateStage2(Long id, StageTwoDto stageTwoDto, String username) {
        CorporateApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        StageTwoCheck stageTwo = app.getStageTwo();
        if (stageTwo == null) {
            stageTwo = new StageTwoCheck();
            app.setStageTwo(stageTwo);
        }

        updateStageTwoEntity(stageTwo, stageTwoDto);
        updateApplicationStatusFromStage2(app, stageTwoDto.getStatus());

        app.setUpdatedBy(username);
        CorporateApplication saved = applicationRepository.save(app);

        log.info("Stage 2 updated for application {} by {}", id, username);

        return mapper.toDetailDto(saved);
    }

    // =============== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===============

    private void updateStageOneEntity(StageOneCheck entity, StageOneDto dto) {
        entity.setGsmLevel(dto.getGsmLevel());
        entity.setSensorConnectionPhoto(dto.getSensorConnectionPhoto());
        entity.setPanicSignalType(dto.isPanicSignalType());
        entity.setCsmPanicSignal(dto.isCsmPanicSignal());
        entity.setInstructionSticker(dto.isInstructionSticker());
        entity.setArmingDisarming(dto.isArmingDisarming());
        entity.setBackupPower(dto.isBackupPower());
        entity.setHighCeilings(dto.isHighCeilings());
        entity.setCheckDate(dto.getCheckDate());
        entity.setInspector(dto.getInspector());
        entity.setComments(dto.getComments());
        entity.setStatus(dto.getStatus());
    }

    private void updateStageTwoEntity(StageTwoCheck entity, StageTwoDto dto) {
        entity.setEquipmentRental(dto.isEquipmentRental());
        entity.setRentalComment(dto.getRentalComment());
        entity.setStickersStandard(dto.isStickersStandard());
        entity.setSystemPhotos(dto.isSystemPhotos());
        entity.setForm002Filled(dto.isForm002Filled());
        entity.setAccessRoads(dto.isAccessRoads());
        entity.setFloorPlan(dto.isFloorPlan());
        entity.setFireAlarm(dto.isFireAlarm());
        entity.setFireAlarmChecklist(dto.getFireAlarmChecklist());
        entity.setAcceptanceCertificate(dto.isAcceptanceCertificate());
        entity.setDefectAct(dto.isDefectAct());
        entity.setElectronicChecklist(dto.isElectronicChecklist());
        entity.setPostInstallationIssues(dto.isPostInstallationIssues());
        entity.setIncompleteForm002(dto.isIncompleteForm002());
        entity.setCheckDate(dto.getCheckDate());
        entity.setInspector(dto.getInspector());
        entity.setComments(dto.getComments());
        entity.setStatus(dto.getStatus());
    }

    private void updateApplicationStatusFromStage1(CorporateApplication app, StageStatus newStatus) {
        if (newStatus == StageStatus.OK) {
            app.setStatus(ApplicationStatus.STAGE1_COMPLETED);
        } else if (newStatus == StageStatus.NOK) {
            app.setStatus(ApplicationStatus.REJECTED);
        }
    }

    private void updateApplicationStatusFromStage2(CorporateApplication app, StageStatus newStatus) {
        if (newStatus == StageStatus.OK) {
            app.setStatus(ApplicationStatus.STAGE2_COMPLETED);
        } else if (newStatus == StageStatus.NOK) {
            app.setStatus(ApplicationStatus.REJECTED);
        }
    }

    // =============== НОВЫЕ МЕТОДЫ ДЛЯ ПОИСКА И ЭКСПОРТА ===============

    @Transactional(readOnly = true)
    public List<ApplicationSummaryDto> findByDate(LocalDate date) {
        return applicationRepository.findByInstallationDate(date)
                .stream()
                .map(mapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    // НОВЫЙ МЕТОД: Поиск заявок, обработанных сегодня (созданных или обновленных)
    @Transactional(readOnly = true)
    public List<ApplicationSummaryDto> findProcessedToday() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        return applicationRepository.findByProcessedToday(startOfDay, endOfDay)
                .stream()
                .map(mapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationSummaryDto> findByIds(List<Long> ids) {
        return applicationRepository.findAllById(ids)
                .stream()
                .map(mapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationSummaryDto> searchApplications(String query, LocalDate date, String scope) {
        // Этот метод можно реализовать позже для сложного поиска на сервере
        // Пока поиск реализован на клиенте
        return null;
    }

    @Transactional(readOnly = true)
    public List<ApplicationSummaryDto> searchArchive(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "installationDate"));

        if (search == null || search.trim().isEmpty()) {
            return applicationRepository.findAll(pageable)
                    .stream()
                    .map(mapper::toSummaryDto)
                    .collect(Collectors.toList());
        }

        return applicationRepository.searchArchive(search, pageable)
                .stream()
                .map(mapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    public ApplicationSummaryDto getSummary(Long id) {
        CorporateApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        return mapper.toSummaryDto(app);
    }
}