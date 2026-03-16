package com.corpcheck.check.websocket;

import com.corpcheck.check.dto.ApplicationDetailDto;
import com.corpcheck.check.dto.WebSocketDto;
import com.corpcheck.check.service.CorporateApplicationService;
import com.corpcheck.check.service.WebSocketSessionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.Set;

@Controller
public class ApplicationWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(ApplicationWebSocketController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final WebSocketSessionService sessionService;
    private final CorporateApplicationService applicationService;

    @Autowired
    public ApplicationWebSocketController(
            SimpMessagingTemplate messagingTemplate,
            WebSocketSessionService sessionService,
            CorporateApplicationService applicationService) {
        this.messagingTemplate = messagingTemplate;
        this.sessionService = sessionService;
        this.applicationService = applicationService;
    }

    @MessageMapping("/user.connect")
    public void connect(Principal principal,
                        @Header("simpSessionId") String sessionId) {
        if (principal != null) {
            sessionService.addUserSession(sessionId, principal.getName());
            log.debug("User connected via WebSocket: {}", principal.getName());
        }
    }

    @MessageMapping("/user.disconnect")
    public void disconnect(Principal principal,
                           @Header("simpSessionId") String sessionId) {
        sessionService.removeUserSession(sessionId);
        log.debug("User disconnected via WebSocket: {}",
                principal != null ? principal.getName() : "unknown");
    }

    @MessageMapping("/user.ping")
    public void ping(Principal principal,
                     @Header("simpSessionId") String sessionId) {
        sessionService.updateUserActivity(sessionId);
    }

    @SubscribeMapping("/applications")
    public Set<String> subscribeToApplications() {
        return sessionService.getOnlineUsernames();
    }

    @SubscribeMapping("/users")
    public Map<String, Object> getOnlineUsers() {
        return sessionService.getOnlineUsers();
    }

    @MessageMapping("/application.get")
    public void getApplication(@Payload Map<String, Object> payload,
                               Principal principal) {
        try {
            Long id = Long.parseLong(payload.get("id").toString());
            ApplicationDetailDto app = applicationService.findById(id);

            WebSocketDto response = WebSocketDto.builder()
                    .type("RESPONSE")
                    .action("GET_APPLICATION")
                    .applicationId(id)
                    .data(app)
                    .username(principal.getName())
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/reply",
                    response
            );
        } catch (Exception e) {
            log.error("Error getting application: {}", e.getMessage());
        }
    }
}