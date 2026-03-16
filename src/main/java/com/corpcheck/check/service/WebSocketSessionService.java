package com.corpcheck.check.service;

import com.corpcheck.check.dto.WebSocketDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class WebSocketSessionService {

    private static final Logger log = LoggerFactory.getLogger(WebSocketSessionService.class);

    private final Map<String, String> activeSessions = new ConcurrentHashMap<>();
    private final Map<String, String> editLocks = new ConcurrentHashMap<>();
    private final Map<String, Long> lastActivity = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> userSubscriptions = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> applicationSubscribers = new ConcurrentHashMap<>();

    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    public void setMessagingTemplate(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // =============== УПРАВЛЕНИЕ СЕССИЯМИ ===============

    public void addUserSession(String sessionId, String username) {
        activeSessions.put(sessionId, username);
        lastActivity.put(sessionId, System.currentTimeMillis());
        broadcastOnlineUsers();
        log.info("User connected: {} (total: {})", username, activeSessions.size());
    }

    public void removeUserSession(String sessionId) {
        String username = activeSessions.remove(sessionId);
        lastActivity.remove(sessionId);

        if (username != null) {
            releaseUserLocks(username);
            removeAllSubscriptions(username);
            broadcastOnlineUsers();
            log.info("User disconnected: {} (total: {})", username, activeSessions.size());
        }
    }

    public void updateUserActivity(String sessionId) {
        if (activeSessions.containsKey(sessionId)) {
            lastActivity.put(sessionId, System.currentTimeMillis());
        }
    }

    public Set<String> getOnlineUsernames() {
        return Set.copyOf(activeSessions.values());
    }

    public Map<String, Object> getOnlineUsers() {
        return activeSessions.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Map.of(
                                "username", e.getValue(),
                                "lastSeen", lastActivity.getOrDefault(e.getKey(), 0L),
                                "active", true
                        )
                ));
    }

    // =============== УПРАВЛЕНИЕ ПОДПИСКАМИ ===============

    public void addSubscription(String username, String applicationId, String destination) {
        userSubscriptions.computeIfAbsent(username, k -> ConcurrentHashMap.newKeySet())
                .add(destination);

        applicationSubscribers.computeIfAbsent(applicationId, k -> ConcurrentHashMap.newKeySet())
                .add(username);

        log.debug("User {} subscribed to {}", username, destination);
    }

    public void removeSubscriptions(String username, String sessionId) {
        Set<String> subscriptions = userSubscriptions.remove(username);
        if (subscriptions != null) {
            subscriptions.forEach(dest -> {
                if (dest.startsWith("/topic/application/")) {
                    String appId = dest.replace("/topic/application/", "");
                    Set<String> subscribers = applicationSubscribers.get(appId);
                    if (subscribers != null) {
                        subscribers.remove(username);
                    }
                }
            });
        }
    }

    public void removeAllSubscriptions(String username) {
        Set<String> subscriptions = userSubscriptions.remove(username);
        if (subscriptions != null) {
            subscriptions.forEach(dest -> {
                if (dest.startsWith("/topic/application/")) {
                    String appId = dest.replace("/topic/application/", "");
                    Set<String> subscribers = applicationSubscribers.get(appId);
                    if (subscribers != null) {
                        subscribers.remove(username);
                    }
                }
            });
        }
    }

    public Set<String> getApplicationSubscribers(String applicationId) {
        return applicationSubscribers.getOrDefault(applicationId, Set.of());
    }

    public boolean isSubscribed(String username, String applicationId) {
        Set<String> subscribers = applicationSubscribers.get(applicationId);
        return subscribers != null && subscribers.contains(username);
    }

    // =============== УПРАВЛЕНИЕ БЛОКИРОВКАМИ ===============

    public boolean tryLock(String applicationId, String stage, String username) {
        String lockKey = applicationId + "_" + stage;
        String currentLock = editLocks.putIfAbsent(lockKey, username);

        if (currentLock == null) {
            broadcastLockStatus(applicationId, stage, username, "LOCKED");
            log.info("Lock acquired: {}/{} by {}", applicationId, stage, username);
            return true;
        }

        return currentLock.equals(username);
    }

    public boolean releaseLock(String applicationId, String stage, String username) {
        String lockKey = applicationId + "_" + stage;
        String currentLock = editLocks.get(lockKey);

        if (username.equals(currentLock)) {
            editLocks.remove(lockKey);
            broadcastLockStatus(applicationId, stage, null, "UNLOCKED");
            log.info("Lock released: {}/{} by {}", applicationId, stage, username);
            return true;
        }

        return false;
    }

    public String getLockOwner(String applicationId, String stage) {
        return editLocks.get(applicationId + "_" + stage);
    }

    public boolean isLocked(String applicationId, String stage) {
        return editLocks.containsKey(applicationId + "_" + stage);
    }

    private void releaseUserLocks(String username) {
        Set<String> locksToRemove = editLocks.entrySet().stream()
                .filter(entry -> username.equals(entry.getValue()))
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        locksToRemove.forEach(lockKey -> {
            editLocks.remove(lockKey);
            String[] parts = lockKey.split("_");
            if (parts.length == 2) {
                broadcastLockStatus(parts[0], parts[1], null, "UNLOCKED");
                log.info("Lock auto-released: {} by {}", lockKey, username);
            }
        });
    }

    // =============== РАССЫЛКА СООБЩЕНИЙ ===============

    // Убедитесь, что этот метод есть в классе и он public
    public void broadcastLockStatus(String applicationId, String stage, String username, String action) {
        try {
            WebSocketDto dto = WebSocketDto.builder()
                    .type("LOCK")
                    .action(action)
                    .applicationId(Long.parseLong(applicationId))
                    .stage(stage)
                    .lockOwner(username)
                    .timestamp(System.currentTimeMillis())
                    .build();

            messagingTemplate.convertAndSend("/topic/editing/" + applicationId, dto);
            log.info("Broadcast lock status: {}/{} - {} by {}", applicationId, stage, action, username);
        } catch (Exception e) {
            log.error("Error broadcasting lock status: {}", e.getMessage());
        }
    }

    public void broadcastOnlineUsers() {
        WebSocketDto dto = WebSocketDto.builder()
                .type("USERS")
                .action("ONLINE_USERS")
                .userInfo(getOnlineUsers())
                .timestamp(System.currentTimeMillis())
                .build();

        messagingTemplate.convertAndSend("/topic/users", dto);
    }

    public void broadcastUpdate(Long applicationId, String stage, Object data, String username) {
        WebSocketDto dto = WebSocketDto.createUpdate(applicationId, stage, data, username);
        messagingTemplate.convertAndSend("/topic/application/" + applicationId, dto);
    }

    public void broadcastToSubscribers(Long applicationId, Object data) {
        Set<String> subscribers = getApplicationSubscribers(String.valueOf(applicationId));
        subscribers.forEach(username -> {
            messagingTemplate.convertAndSendToUser(
                    username,
                    "/queue/updates",
                    data
            );
        });
    }
}