package com.corpcheck.check.service;

import com.corpcheck.check.dto.ApplicationDetailDto;
import com.corpcheck.check.dto.WebSocketDto;
import com.corpcheck.check.model.CorporateApplication;
import com.corpcheck.check.model.enums.ApplicationStatus;
import com.corpcheck.check.model.enums.StageStatus;
import com.corpcheck.check.repository.CorporateApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StageTransitionService {

    private static final Logger log = LoggerFactory.getLogger(StageTransitionService.class);

    private final CorporateApplicationRepository applicationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CorporateApplicationService applicationService;

    @Autowired
    public StageTransitionService(
            CorporateApplicationRepository applicationRepository,
            SimpMessagingTemplate messagingTemplate,
            CorporateApplicationService applicationService) {
        this.applicationRepository = applicationRepository;
        this.messagingTemplate = messagingTemplate;
        this.applicationService = applicationService;
    }

    @Transactional
    public ApplicationDetailDto progressToNextStage(Long applicationId, String username) {
        CorporateApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        ApplicationStatus oldStatus = app.getStatus();
        ApplicationStatus newStatus = calculateNextStatus(app);

        if (oldStatus != newStatus) {
            app.setStatus(newStatus);
            app.setUpdatedBy(username);

            CorporateApplication saved = applicationRepository.save(app);

            WebSocketDto notification = WebSocketDto.builder()
                    .type("STATUS_CHANGE")
                    .action("PROGRESS")
                    .applicationId(applicationId)
                    .data(java.util.Map.of(
                            "oldStatus", oldStatus,
                            "newStatus", newStatus
                    ))
                    .username(username)
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSend("/topic/application/" + applicationId, notification);

            log.info("Application {} progressed from {} to {} by {}",
                    applicationId, oldStatus, newStatus, username);
        }

        return applicationService.findById(applicationId);
    }

    private ApplicationStatus calculateNextStatus(CorporateApplication app) {
        switch (app.getStatus()) {
            case DRAFT:
                return ApplicationStatus.STAGE1_PENDING;

            case STAGE1_PENDING:
                if (app.getStageOne() != null && app.getStageOne().getStatus() == StageStatus.OK) {
                    return ApplicationStatus.STAGE1_COMPLETED;
                } else {
                    return ApplicationStatus.REJECTED;
                }

            case STAGE1_COMPLETED:
                return ApplicationStatus.STAGE2_PENDING;

            case STAGE2_PENDING:
                if (app.getStageTwo() != null && app.getStageTwo().getStatus() == StageStatus.OK) {
                    return ApplicationStatus.STAGE2_COMPLETED;
                } else {
                    return ApplicationStatus.REJECTED;
                }

            case STAGE2_COMPLETED:
                return ApplicationStatus.COMPLETED;

            default:
                return app.getStatus();
        }
    }

    @Transactional
    public ApplicationDetailDto rollbackToPreviousStage(Long applicationId, String username, String reason) {
        CorporateApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        ApplicationStatus newStatus;
        switch (app.getStatus()) {
            case STAGE2_PENDING:
            case STAGE2_COMPLETED:
                newStatus = ApplicationStatus.STAGE1_COMPLETED;
                break;
            case STAGE1_COMPLETED:
                newStatus = ApplicationStatus.STAGE1_PENDING;
                break;
            default:
                newStatus = app.getStatus();
        }

        app.setStatus(newStatus);
        app.setUpdatedBy(username);

        String rollbackComment = String.format("[ОТКАТ] %s: %s", username, reason);
        String existingComments = app.getComments();
        app.setComments(existingComments != null ?
                rollbackComment + "\n" + existingComments :
                rollbackComment);

        CorporateApplication saved = applicationRepository.save(app);

        log.info("Application {} rolled back to {} by {}: {}",
                applicationId, newStatus, username, reason);

        return applicationService.findById(applicationId);
    }

    public boolean canProgress(Long applicationId) {
        CorporateApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        switch (app.getStatus()) {
            case STAGE1_PENDING:
                return app.getStageOne() != null && app.getStageOne().isComplete();
            case STAGE2_PENDING:
                return app.getStageTwo() != null && app.getStageTwo().isComplete();
            default:
                return false;
        }
    }
}