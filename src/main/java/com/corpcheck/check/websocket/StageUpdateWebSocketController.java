package com.corpcheck.check.websocket;

import com.corpcheck.check.dto.StageOneDto;
import com.corpcheck.check.dto.StageTwoDto;
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
public class StageUpdateWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(StageUpdateWebSocketController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final WebSocketSessionService sessionService;
    private final CorporateApplicationService applicationService;
    private final ObjectMapper objectMapper;

    @Autowired
    public StageUpdateWebSocketController(
            SimpMessagingTemplate messagingTemplate,
            WebSocketSessionService sessionService,
            CorporateApplicationService applicationService,
            ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.sessionService = sessionService;
        this.applicationService = applicationService;
        this.objectMapper = objectMapper;
    }

    @MessageMapping("/update.stage1")
    public void updateStage1(@Payload Map<String, Object> payload,
                             Principal principal) {
        if (principal == null) return;

        try {
            Long applicationId = Long.parseLong(payload.get("applicationId").toString());
            Map<String, Object> data = (Map<String, Object>) payload.get("data");

            String owner = sessionService.getLockOwner(
                    String.valueOf(applicationId), "stage1"
            );

            if (!principal.getName().equals(owner)) {
                WebSocketDto error = WebSocketDto.builder()
                        .type("ERROR")
                        .action("UPDATE_FAILED")
                        .applicationId(applicationId)
                        .data(Map.of("message", "Нет прав на редактирование"))
                        .timestamp(System.currentTimeMillis())
                        .build();

                messagingTemplate.convertAndSendToUser(
                        principal.getName(),
                        "/queue/reply",
                        error
                );
                return;
            }

            StageOneDto stageOneDto = objectMapper.convertValue(data, StageOneDto.class);
            applicationService.updateStage1(applicationId, stageOneDto, principal.getName());

            WebSocketDto update = WebSocketDto.createUpdate(
                    applicationId, "stage1", data, principal.getName()
            );

            messagingTemplate.convertAndSend("/topic/application/" + applicationId, update);

            log.info("Stage 1 updated via WebSocket: {} by {}", applicationId, principal.getName());

        } catch (Exception e) {
            log.error("Error updating stage 1: {}", e.getMessage());

            WebSocketDto error = WebSocketDto.builder()
                    .type("ERROR")
                    .action("UPDATE_FAILED")
                    .data(Map.of("message", e.getMessage()))
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/reply",
                    error
            );
        }
    }

    @MessageMapping("/update.stage2")
    public void updateStage2(@Payload Map<String, Object> payload,
                             Principal principal) {
        if (principal == null) return;

        try {
            Long applicationId = Long.parseLong(payload.get("applicationId").toString());
            Map<String, Object> data = (Map<String, Object>) payload.get("data");

            String owner = sessionService.getLockOwner(
                    String.valueOf(applicationId), "stage2"
            );

            if (!principal.getName().equals(owner)) {
                WebSocketDto error = WebSocketDto.builder()
                        .type("ERROR")
                        .action("UPDATE_FAILED")
                        .applicationId(applicationId)
                        .data(Map.of("message", "Нет прав на редактирование"))
                        .timestamp(System.currentTimeMillis())
                        .build();

                messagingTemplate.convertAndSendToUser(
                        principal.getName(),
                        "/queue/reply",
                        error
                );
                return;
            }

            StageTwoDto stageTwoDto = objectMapper.convertValue(data, StageTwoDto.class);
            applicationService.updateStage2(applicationId, stageTwoDto, principal.getName());

            WebSocketDto update = WebSocketDto.createUpdate(
                    applicationId, "stage2", data, principal.getName()
            );

            messagingTemplate.convertAndSend("/topic/application/" + applicationId, update);

            log.info("Stage 2 updated via WebSocket: {} by {}", applicationId, principal.getName());

        } catch (Exception e) {
            log.error("Error updating stage 2: {}", e.getMessage());

            WebSocketDto error = WebSocketDto.builder()
                    .type("ERROR")
                    .action("UPDATE_FAILED")
                    .data(Map.of("message", e.getMessage()))
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/reply",
                    error
            );
        }
    }

    @MessageMapping("/update.bulk")
    public void bulkUpdate(@Payload Map<String, Object> payload,
                           Principal principal) {
        if (principal == null) return;

        try {
            Long applicationId = Long.parseLong(payload.get("applicationId").toString());
            Map<String, Object> updates = (Map<String, Object>) payload.get("updates");

            log.info("Bulk update for {}: {} fields by {}",
                    applicationId, updates.size(), principal.getName());

            WebSocketDto response = WebSocketDto.builder()
                    .type("BULK_UPDATE")
                    .action("COMPLETED")
                    .applicationId(applicationId)
                    .username(principal.getName())
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSend("/topic/application/" + applicationId, response);

        } catch (Exception e) {
            log.error("Bulk update error: {}", e.getMessage());
        }
    }
}