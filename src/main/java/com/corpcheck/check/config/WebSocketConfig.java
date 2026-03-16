package com.corpcheck.check.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Префиксы для отправки сообщений клиентам
        config.enableSimpleBroker("/topic", "/queue", "/user");

        // Префикс для сообщений от клиентов к серверу
        config.setApplicationDestinationPrefixes("/app");

        // Префикс для персональных сообщений
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Эндпоинт для WebSocket соединения с поддержкой SockJS
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // В продакшене заменить на конкретные домены
                .withSockJS()
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js");

        // Альтернативный эндпоинт без SockJS для современных браузеров
        registry.addEndpoint("/ws-direct")
                .setAllowedOriginPatterns("*");
    }
}