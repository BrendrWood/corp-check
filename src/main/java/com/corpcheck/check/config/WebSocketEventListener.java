package com.corpcheck.check.config;

import com.corpcheck.check.service.WebSocketSessionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.security.Principal;

@Component
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final WebSocketSessionService sessionService;

    @Autowired
    public WebSocketEventListener(WebSocketSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        String sessionId = headerAccessor.getSessionId();

        if (principal != null) {
            sessionService.addUserSession(sessionId, principal.getName());
            log.info("WebSocket connected: {} - {}", principal.getName(), sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        Principal principal = headerAccessor.getUser();

        sessionService.removeUserSession(sessionId);
        log.info("WebSocket disconnected: {} - {}",
                principal != null ? principal.getName() : "unknown", sessionId);
    }

    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();
        Principal principal = headerAccessor.getUser();
        String sessionId = headerAccessor.getSessionId();

        if (destination != null && principal != null) {
            log.debug("User {} subscribed to {}", principal.getName(), destination);

            if (destination.startsWith("/topic/application/")) {
                String applicationId = destination.replace("/topic/application/", "");
                sessionService.addSubscription(principal.getName(), applicationId, destination);
            }
        }
    }

    @EventListener
    public void handleWebSocketUnsubscribeListener(SessionUnsubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();
        String sessionId = headerAccessor.getSessionId();

        if (principal != null) {
            sessionService.removeSubscriptions(principal.getName(), sessionId);
            log.debug("User {} unsubscribed", principal.getName());
        }
    }
}