package com.corpcheck.check.dto;

import java.time.LocalDateTime;

public class SuccessResponseDto {
    private int status;
    private String message;
    private Object data;
    private LocalDateTime timestamp;

    public SuccessResponseDto() {
    }

    private SuccessResponseDto(Builder builder) {
        this.status = builder.status;
        this.message = builder.message;
        this.data = builder.data;
        this.timestamp = builder.timestamp;
    }

    // Геттеры
    public int getStatus() { return status; }
    public String getMessage() { return message; }
    public Object getData() { return data; }
    public LocalDateTime getTimestamp() { return timestamp; }

    // Сеттеры
    public void setStatus(int status) { this.status = status; }
    public void setMessage(String message) { this.message = message; }
    public void setData(Object data) { this.data = data; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private int status;
        private String message;
        private Object data;
        private LocalDateTime timestamp;

        public Builder status(int status) {
            this.status = status;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder data(Object data) {
            this.data = data;
            return this;
        }

        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public SuccessResponseDto build() {
            return new SuccessResponseDto(this);
        }
    }

    public static SuccessResponseDto of(String message, Object data) {
        return builder()
                .status(200)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static SuccessResponseDto created(String message, Object data) {
        return builder()
                .status(201)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static SuccessResponseDto noContent(String message) {
        return builder()
                .status(204)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}