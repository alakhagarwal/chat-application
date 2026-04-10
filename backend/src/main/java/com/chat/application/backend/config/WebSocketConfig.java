package com.chat.application.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // routes messages to server
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.setApplicationDestinationPrefixes("/app"); // to the server from client
        config.enableSimpleBroker("/topic"); // to the clients subscribed to the topic from server
    }

    // The configureMessageBroker method configures the message broker.
    // It sets the application destination prefix to "/app", which means that messages sent from the client to the server should have this prefix.
    // It also enables a simple in-memory message broker that will handle messages sent to destinations prefixed with "/topic". This allows clients to subscribe to topics and receive messages broadcasted by the server.

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat").setAllowedOriginPatterns("http://localhost:5173").withSockJS();
    }

    // /chat is the endpoint for the clients to connect to the WebSocket server.
}
