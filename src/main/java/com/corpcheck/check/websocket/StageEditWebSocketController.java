package com.corpcheck.check.websocket;

import com.corpcheck.check.dto.WebSocketDto;
import com.corpcheck.check.service.CorporateApplicationService;
import com.corpcheck.check.service.WebSocketSessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
public class StageEditWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(StageEditWebSocketController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final WebSocketSessionService sessionService;
    private final CorporateApplicationService applicationService;
    private final ObjectMapper objectMapper;

    @Autowired
    public StageEditWebSocketController(
            SimpMessagingTemplate messagingTemplate,
            WebSocketSessionService sessionService,
            CorporateApplicationService applicationService,
            ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.sessionService = sessionService;
        this.applicationService = applicationService;
        this.objectMapper = objectMapper;
    }

    @MessageMapping("/edit.start")
    public void startEditing(@Payload Map<String, Object> payload,
                             Principal principal) {
        if (principal == null) return;

        Long applicationId = Long.parseLong(payload.get("applicationId").toString());
        String stage = payload.get("stage").toString();

        boolean locked = sessionService.tryLock(
                String.valueOf(applicationId),
                stage,
                principal.getName()
        );

        if (locked) {
            WebSocketDto confirm = WebSocketDto.createLock(
                    applicationId, stage, principal.getName()
            );
            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/reply",
                    confirm
            );
            log.info("Edit started: {}/{} by {}", applicationId, stage, principal.getName());
        } else {
            String owner = sessionService.getLockOwner(
                    String.valueOf(applicationId), stage
            );

            WebSocketDto error = WebSocketDto.builder()
                    .type("ERROR")
                    .action("LOCK_FAILED")
                    .applicationId(applicationId)
                    .stage(stage)
                    .lockOwner(owner)
                    .data(Map.of("message", "Этап уже редактируется пользователем " + owner))
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/reply",
                    error
            );
        }
    }

    @MessageMapping("/edit.end")
    public void endEditing(@Payload Map<String, Object> payload,
                           Principal principal) {
        if (principal == null) return;

        Long applicationId = Long.parseLong(payload.get("applicationId").toString());
        String stage = payload.get("stage").toString();

        boolean released = sessionService.releaseLock(
                String.valueOf(applicationId),
                stage,
                principal.getName()
        );

        if (released) {
            log.info("Edit ended: {}/{} by {}", applicationId, stage, principal.getName());
        }
    }

    @MessageMapping("/edit.forceRelease")
    public void forceReleaseLock(@Payload Map<String, Object> payload,
                                 Principal principal) {
        if (principal == null) return;

        if (!"balakin".equals(principal.getName())) {
            return;
        }

        Long applicationId = Long.parseLong(payload.get("applicationId").toString());
        String stage = payload.get("stage").toString();
        String targetUser = payload.get("username").toString();

        String currentOwner = sessionService.getLockOwner(
                String.valueOf(applicationId), stage
        );

        if (targetUser.equals(currentOwner)) {
            sessionService.releaseLock(String.valueOf(applicationId), stage, targetUser);
            log.info("Lock force released: {}/{} from {} by {}",
                    applicationId, stage, targetUser, principal.getName());
        }
    }

    @MessageMapping("/edit.autosave")
    public void autosave(@Payload Map<String, Object> payload,
                         Principal principal) {
        if (principal == null) return;

        try {
            Long applicationId = Long.parseLong(payload.get("applicationId").toString());
            String stage = payload.get("stage").toString();

            String owner = sessionService.getLockOwner(
                    String.valueOf(applicationId), stage
            );

            if (!principal.getName().equals(owner)) {
                return;
            }

            log.debug("Autosave for {}/{} by {}", applicationId, stage, principal.getName());

            WebSocketDto confirm = WebSocketDto.builder()
                    .type("AUTOSAVE")
                    .action("SAVED")
                    .applicationId(applicationId)
                    .stage(stage)
                    .username(principal.getName())
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/reply",
                    confirm
            );

        } catch (Exception e) {
            log.error("Autosave error: {}", e.getMessage());
        }
    }
}