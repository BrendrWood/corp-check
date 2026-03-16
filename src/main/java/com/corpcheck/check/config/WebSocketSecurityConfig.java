package com.corpcheck.check.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
                // Разрешаем все сообщения от аутентифицированных пользователей
                .anyMessage().authenticated();
    }

    @Override
    protected boolean sameOriginDisabled() {
        // Разрешаем кросс-доменные запросы для WebSocket
        return true;
    }
}