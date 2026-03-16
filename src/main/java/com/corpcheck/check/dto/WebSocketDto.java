package com.corpcheck.check.dto;

import java.util.Map;

public class WebSocketDto {
    private String type;           // "UPDATE", "LOCK", "UNLOCK", "USER_JOINED", "USER_LEFT"
    private String action;         // "STAGE1_UPDATE", "STAGE2_UPDATE", "EDIT_START", "EDIT_END"
    private Long applicationId;
    private String username;
    private Object data;           // Любые данные (DTO, Map, и т.д.)
    private long timestamp;

    // Для блокировок
    private String stage;          // "stage1" или "stage2"
    private String lockOwner;

    // Для онлайн пользователей
    private Map<String, Object> userInfo;

    public WebSocketDto() {
    }

    private WebSocketDto(Builder builder) {
        this.type = builder.type;
        this.action = builder.action;
        this.applicationId = builder.applicationId;
        this.username = builder.username;
        this.data = builder.data;
        this.timestamp = builder.timestamp;
        this.stage = builder.stage;
        this.lockOwner = builder.lockOwner;
        this.userInfo = builder.userInfo;
    }

    // =============== ГЕТТЕРЫ ===============

    public String getType() {
        return type;
    }

    public String getAction() {
        return action;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public String getUsername() {
        return username;
    }

    public Object getData() {
        return data;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public String getStage() {
        return stage;
    }

    public String getLockOwner() {
        return lockOwner;
    }

    public Map<String, Object> getUserInfo() {
        return userInfo;
    }

    // =============== СЕТТЕРЫ ===============

    public void setType(String type) {
        this.type = type;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public void setLockOwner(String lockOwner) {
        this.lockOwner = lockOwner;
    }

    public void setUserInfo(Map<String, Object> userInfo) {
        this.userInfo = userInfo;
    }

    // =============== BUILDER ===============

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String type;
        private String action;
        private Long applicationId;
        private String username;
        private Object data;
        private long timestamp;
        private String stage;
        private String lockOwner;
        private Map<String, Object> userInfo;

        public Builder type(String type) {
            this.type = type;
            return this;
        }

        public Builder action(String action) {
            this.action = action;
            return this;
        }

        public Builder applicationId(Long applicationId) {
            this.applicationId = applicationId;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder data(Object data) {
            this.data = data;
            return this;
        }

        public Builder timestamp(long timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder stage(String stage) {
            this.stage = stage;
            return this;
        }

        public Builder lockOwner(String lockOwner) {
            this.lockOwner = lockOwner;
            return this;
        }

        public Builder userInfo(Map<String, Object> userInfo) {
            this.userInfo = userInfo;
            return this;
        }

        public WebSocketDto build() {
            return new WebSocketDto(this);
        }
    }

    // =============== ФАБРИЧНЫЕ МЕТОДЫ ===============

    public static WebSocketDto createUpdate(Long appId, String stage, Object data, String username) {
        return builder()
                .type("UPDATE")
                .action(stage.equals("stage1") ? "STAGE1_UPDATE" : "STAGE2_UPDATE")
                .applicationId(appId)
                .data(data)
                .username(username)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WebSocketDto createLock(Long appId, String stage, String username) {
        return builder()
                .type("LOCK")
                .action("EDIT_START")
                .applicationId(appId)
                .stage(stage)
                .lockOwner(username)
                .username(username)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WebSocketDto createUnlock(Long appId, String stage, String username) {
        return builder()
                .type("UNLOCK")
                .action("EDIT_END")
                .applicationId(appId)
                .stage(stage)
                .lockOwner(null)
                .username(username)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}