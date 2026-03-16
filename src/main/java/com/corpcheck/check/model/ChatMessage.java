package com.corpcheck.check.model;

import java.time.LocalDateTime;

public class ChatMessage {
    private String username;
    private String message;
    private LocalDateTime timestamp;

    public ChatMessage() {}

    public ChatMessage(String username, String message) {
        this.username = username;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    // Геттеры и сеттеры
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}