package com.example.notificationservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
public class NotificationController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public NotificationController(SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    // This method will be called by the Kafka consumer when a new order is received
    public void sendOrderNotification(String orderJson) {
        System.out.println("Received order notification: " + orderJson);
        
        try {
            // Parse the incoming JSON
            JsonNode orderNode = objectMapper.readTree(orderJson);
            
            // Extract order details with null checks
            String orderId = orderNode.has("orderId") ? 
                orderNode.get("orderId").asText() : 
                (orderNode.has("id") ? orderNode.get("id").asText() : "UNKNOWN");
                
            double total = orderNode.has("total") ? 
                orderNode.get("total").asDouble() : 0.0;
            
            // Create a notification object
            ObjectNode notification = objectMapper.createObjectNode();
            notification.put("id", "order-" + System.currentTimeMillis());
            notification.put("title", "New Order #" + orderId);
            notification.put("message", String.format("New order received with total: $%.2f", total));
            notification.put("date", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            notification.put("read", false);
            notification.put("type", "order");
            notification.put("orderId", orderId);
            notification.put("total", total);
            notification.set("orderDetails", orderNode);
            
            String notificationJson = notification.toString();
            System.out.println("Sending notification: " + notificationJson);
            
            // Send the formatted notification to all subscribed clients
            messagingTemplate.convertAndSend("/topic/orders", notificationJson);
            
        } catch (Exception e) {
            // Log the error but don't crash the application
            System.err.println("Error processing order notification: " + e.getMessage());
            e.printStackTrace();
            
            // Send a simpler error message
            try {
                ObjectNode error = objectMapper.createObjectNode();
                error.put("error", "Failed to process order");
                error.put("message", e.getMessage());
                error.put("rawMessage", orderJson);
                messagingTemplate.convertAndSend("/topic/errors", error.toString());
            } catch (Exception ex) {
                // Last resort if even error serialization fails
                messagingTemplate.convertAndSend("/topic/errors", 
                    "{\"error\":\"Failed to process order\"}");
            }
        }
    }
}
