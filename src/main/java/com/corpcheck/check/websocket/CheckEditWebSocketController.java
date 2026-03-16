package com.corpcheck.check.websocket;

import com.corpcheck.check.dto.WebSocketDto;
import com.corpcheck.check.service.WebSocketSessionService;
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
public class CheckEditWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(CheckEditWebSocketController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final WebSocketSessionService sessionService;

    @Autowired
    public CheckEditWebSocketController(SimpMessagingTemplate messagingTemplate, WebSocketSessionService sessionService) {
        this.messagingTemplate = messagingTemplate;
        this.sessionService = sessionService;
    }

    @MessageMapping("/edit.check")
    public void checkLock(@Payload Map<String, Object> payload, Principal principal) {
        if (principal == null) {
            log.warn("edit.check: principal is null");
            return;
        }

        try {
            Long applicationId = Long.parseLong(payload.get("applicationId").toString());
            String username = principal.getName();

            log.info("Checking lock for application {} by {}", applicationId, username);

            // Проверяем блокировку для stage1 и stage2 (и для "all")
            String lockOwner1 = sessionService.getLockOwner(String.valueOf(applicationId), "stage1");
            String lockOwner2 = sessionService.getLockOwner(String.valueOf(applicationId), "stage2");
            String lockOwnerAll = sessionService.getLockOwner(String.valueOf(applicationId), "all");

            // Определяем, есть ли блокировка и кто владелец
            String lockOwner = null;
            String lockStage = null;

            if (lockOwnerAll != null) {
                lockOwner = lockOwnerAll;
                lockStage = "all";
            } else if (lockOwner1 != null) {
                lockOwner = lockOwner1;
                lockStage = "stage1";
            } else if (lockOwner2 != null) {
                lockOwner = lockOwner2;
                lockStage = "stage2";
            }

            // Если заявка заблокирована другим пользователем
            if (lockOwner != null && !lockOwner.equals(username)) {
                log.info("Application {} is locked by {} for stage {}", applicationId, lockOwner, lockStage);

                // Отправляем статус блокировки запрашивающему пользователю
                WebSocketDto dto = WebSocketDto.builder()
                        .type("LOCK")
                        .action("CHECK")
                        .applicationId(applicationId)
                        .stage(lockStage)
                        .lockOwner(lockOwner)
                        .timestamp(System.currentTimeMillis())
                        .build();

                messagingTemplate.convertAndSendToUser(username, "/queue/reply", dto);

                // Также отправляем всем подписчикам заявки (чтобы обновить UI)
                messagingTemplate.convertAndSend("/topic/editing/" + applicationId, dto);

            } else if (lockOwner != null && lockOwner.equals(username)) {
                // Блокировка принадлежит текущему пользователю
                log.info("Application {} is locked by current user {}", applicationId, username);

                // Отправляем подтверждение
                WebSocketDto dto = WebSocketDto.builder()
                        .type("LOCK")
                        .action("OWNER")
                        .applicationId(applicationId)
                        .stage(lockStage)
                        .lockOwner(username)
                        .timestamp(System.currentTimeMillis())
                        .build();

                messagingTemplate.convertAndSendToUser(username, "/queue/reply", dto);

            } else {
                // Если не заблокирована, пробуем заблокировать
                log.info("Application {} is not locked, trying to acquire lock for {}", applicationId, username);

                boolean locked = sessionService.tryLock(String.valueOf(applicationId), "all", username);
                if (locked) {
                    log.info("Auto-lock acquired for {} by {}", applicationId, username);

                    // Отправляем подтверждение блокировки
                    WebSocketDto lockDto = WebSocketDto.createLock(applicationId, "all", username);
                    messagingTemplate.convertAndSend("/topic/editing/" + applicationId, lockDto);

                    // Отправляем подтверждение пользователю
                    messagingTemplate.convertAndSendToUser(username, "/queue/reply", lockDto);
                }
            }
        } catch (Exception e) {
            log.error("Error in edit.check: {}", e.getMessage(), e);
        }
    }
}