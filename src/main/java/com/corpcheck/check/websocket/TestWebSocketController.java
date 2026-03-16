package com.corpcheck.check.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
public class TestWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(TestWebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/api/test/websocket")
    public Map<String, Object> testWebSocket(Principal principal) {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "ok");
        result.put("user", principal != null ? principal.getName() : "anonymous");
        result.put("message", "WebSocket is working");

        log.info("Test endpoint called by: {}", principal != null ? principal.getName() : "anonymous");

        return result;
    }
}