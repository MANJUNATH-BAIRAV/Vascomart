package com.example.notificationservice.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class TestController {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public TestController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    @MessageMapping("/test")
    @SendTo("/topic/test")
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "Test message from server");
        return response;
    }
    
    @GetMapping("/api/send-test")
    public String sendTestMessage() {
        Map<String, Object> message = new HashMap<>();
        message.put("id", "test-" + System.currentTimeMillis());
        message.put("title", "Test Message");
        message.put("message", "This is a test message from the server");
        message.put("date", LocalDateTime.now().toString());
        message.put("type", "test");
        
        messagingTemplate.convertAndSend("/topic/orders", message);
        return "Test message sent!";
    }
}
