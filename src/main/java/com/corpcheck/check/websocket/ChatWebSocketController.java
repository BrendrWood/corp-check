package com.corpcheck.check.websocket;

import com.corpcheck.check.dto.WebSocketDto;
import com.corpcheck.check.model.ChatMessageEntity;
import com.corpcheck.check.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Controller
public class ChatWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    // Хранилище просматривающих пользователей для каждой заявки
    private final Map<Long, Map<String, Long>> applicationViewers = new ConcurrentHashMap<>();

    @Autowired
    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @SubscribeMapping("/chat.history")
    public List<Map<String, Object>> getChatHistory(Principal principal) {
        String username = principal != null ? principal.getName() : "unknown";
        log.info("📜 SUBSCRIBE: Запрос истории чата от пользователя: {}", username);

        try {
            List<ChatMessageEntity> messages = chatService.getLastMessages(50);

            List<Map<String, Object>> history = messages.stream()
                    .map(msg -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("username", msg.getUsername());
                        map.put("message", msg.getMessage());
                        map.put("timestamp", msg.getTimestamp().toEpochSecond(java.time.ZoneOffset.UTC) * 1000);
                        return map;
                    })
                    .collect(Collectors.toList());

            log.info("📜 Отправлено {} сообщений истории", history.size());
            return history;
        } catch (Exception e) {
            log.error("Ошибка при получении истории чата: {}", e.getMessage(), e);
            return List.of();
        }
    }

    @MessageMapping("/chat.history")
    public void handleChatHistoryRequest(Principal principal) {
        String username = principal != null ? principal.getName() : "unknown";
        log.info("📬 MESSAGE: Запрос истории чата от пользователя: {}", username);

        try {
            List<ChatMessageEntity> messages = chatService.getLastMessages(50);

            List<Map<String, Object>> history = messages.stream()
                    .map(msg -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("username", msg.getUsername());
                        map.put("message", msg.getMessage());
                        map.put("timestamp", msg.getTimestamp().toEpochSecond(java.time.ZoneOffset.UTC) * 1000);
                        return map;
                    })
                    .collect(Collectors.toList());

            log.info("📬 Отправлено {} сообщений истории через /user/queue/chat.history", history.size());

            messagingTemplate.convertAndSendToUser(username, "/queue/chat.history", history);

        } catch (Exception e) {
            log.error("Ошибка при обработке запроса истории чата: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, Object> payload,
                            Principal principal) {
        if (principal == null) {
            log.warn("Попытка отправить сообщение без аутентификации");
            return;
        }

        String message = payload.get("message").toString();
        String username = principal.getName();

        log.info("💬 Chat message from {}: {}", username, message);

        try {
            ChatMessageEntity savedMessage = chatService.addMessage(username, message);

            WebSocketDto chatMessage = WebSocketDto.builder()
                    .type("CHAT")
                    .action("MESSAGE")
                    .username(username)
                    .data(Map.of(
                            "message", message,
                            "timestamp", savedMessage.getTimestamp().toEpochSecond(java.time.ZoneOffset.UTC) * 1000
                    ))
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSend("/topic/chat", chatMessage);

            log.info("💬 Сообщение отправлено в чат, id: {}", savedMessage.getId());

        } catch (Exception e) {
            log.error("Ошибка при отправке сообщения: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload Map<String, Object> payload,
                       Principal principal) {
        if (principal == null) return;

        WebSocketDto typingNotification = WebSocketDto.builder()
                .type("CHAT")
                .action("TYPING")
                .username(principal.getName())
                .timestamp(System.currentTimeMillis())
                .build();

        messagingTemplate.convertAndSend("/topic/chat", typingNotification);
    }

    /**
     * НОВЫЙ МЕТОД: Уведомление о просмотре заявки
     */
    @MessageMapping("/application.view")
    public void handleApplicationView(@Payload Map<String, Object> payload, Principal principal) {
        if (principal == null) return;

        try {
            Long applicationId = Long.parseLong(payload.get("applicationId").toString());
            String username = principal.getName();
            long timestamp = System.currentTimeMillis();

            log.info("👁️ Пользователь {} просматривает заявку {}", username, applicationId);

            // Добавляем пользователя в список просматривающих
            applicationViewers.computeIfAbsent(applicationId, k -> new ConcurrentHashMap<>())
                    .put(username, timestamp);

            // Очищаем старые записи (пользователи, которые не обновляли просмотр более 30 секунд)
            cleanupOldViewers(applicationId);

            // Отправляем обновленный список всем подписчикам
            Map<String, Object> viewersList = new HashMap<>();
            viewersList.put("viewers", applicationViewers.getOrDefault(applicationId, new ConcurrentHashMap<>()));

            messagingTemplate.convertAndSend("/topic/application/" + applicationId + "/viewers", viewersList);

        } catch (Exception e) {
            log.error("Ошибка при обработке просмотра заявки: {}", e.getMessage());
        }
    }

    /**
     * НОВЫЙ МЕТОД: Уведомление о выходе из заявки
     */
    @MessageMapping("/application.leave")
    public void handleApplicationLeave(@Payload Map<String, Object> payload, Principal principal) {
        if (principal == null) return;

        try {
            Long applicationId = Long.parseLong(payload.get("applicationId").toString());
            String username = principal.getName();

            log.info("👋 Пользователь {} покинул заявку {}", username, applicationId);

            // Удаляем пользователя из списка просматривающих
            if (applicationViewers.containsKey(applicationId)) {
                applicationViewers.get(applicationId).remove(username);

                // Отправляем обновленный список
                Map<String, Object> viewersList = new HashMap<>();
                viewersList.put("viewers", applicationViewers.getOrDefault(applicationId, new ConcurrentHashMap<>()));

                messagingTemplate.convertAndSend("/topic/application/" + applicationId + "/viewers", viewersList);
            }

        } catch (Exception e) {
            log.error("Ошибка при обработке выхода из заявки: {}", e.getMessage());
        }
    }

    /**
     * НОВЫЙ МЕТОД: Обновление заявки
     */
    @MessageMapping("/application.update")
    public void handleApplicationUpdate(@Payload Map<String, Object> payload, Principal principal) {
        if (principal == null) return;

        try {
            Long applicationId = Long.parseLong(payload.get("applicationId").toString());
            String username = principal.getName();

            log.info("📝 Пользователь {} обновил заявку {}", username, applicationId);

            // Добавляем информацию о том, кто обновил
            payload.put("username", username);
            payload.put("timestamp", System.currentTimeMillis());

            // Отправляем обновление всем подписчикам
            messagingTemplate.convertAndSend("/topic/application/updates", payload);

        } catch (Exception e) {
            log.error("Ошибка при обработке обновления заявки: {}", e.getMessage());
        }
    }

    /**
     * НОВЫЙ МЕТОД: Изменение поля
     */
    @MessageMapping("/field.change")
    public void handleFieldChange(@Payload Map<String, Object> payload, Principal principal) {
        if (principal == null) return;

        try {
            Long applicationId = Long.parseLong(payload.get("applicationId").toString());
            String username = principal.getName();
            String field = payload.get("field").toString();

            log.info("✏️ Пользователь {} изменил поле {} в заявке {}", username, field, applicationId);

            // Добавляем информацию о том, кто изменил
            payload.put("username", username);
            payload.put("timestamp", System.currentTimeMillis());

            // Отправляем изменение всем подписчикам заявки
            messagingTemplate.convertAndSend("/topic/application/" + applicationId + "/changes", payload);

        } catch (Exception e) {
            log.error("Ошибка при обработке изменения поля: {}", e.getMessage());
        }
    }

    /**
     * НОВЫЙ МЕТОД: Синхронизация прокрутки
     */
    @MessageMapping("/scroll.sync")
    public void handleScrollSync(@Payload Map<String, Object> payload, Principal principal) {
        if (principal == null) return;

        try {
            Long applicationId = Long.parseLong(payload.get("applicationId").toString());
            String username = principal.getName();
            Integer scrollPosition = (Integer) payload.get("position");

            log.debug("📜 Пользователь {} синхронизирует прокрутку в заявке {}: {}", username, applicationId, scrollPosition);

            // Добавляем информацию о том, кто прокручивает
            payload.put("username", username);
            payload.put("timestamp", System.currentTimeMillis());

            // Отправляем синхронизацию всем подписчикам заявки
            messagingTemplate.convertAndSend("/topic/application/" + applicationId + "/scroll", payload);

        } catch (Exception e) {
            log.error("Ошибка при синхронизации прокрутки: {}", e.getMessage());
        }
    }

    /**
     * НОВЫЙ МЕТОД: Очистка старых просматривающих
     */
    private void cleanupOldViewers(Long applicationId) {
        if (!applicationViewers.containsKey(applicationId)) return;

        long now = System.currentTimeMillis();
        long timeout = 30000; // 30 секунд

        applicationViewers.get(applicationId).entrySet().removeIf(entry ->
                now - entry.getValue() > timeout
        );
    }
}