package com.example.apigateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
public class FallbackController {

    @RequestMapping("/fallback/order")
    public Mono<ResponseEntity<Map<String, Object>>> orderFallback(ServerWebExchange exchange) {
        var request = exchange.getRequest();
        
        // Log the error with request details
        log.error("\n❌ ORDER SERVICE FALLBACK TRIGGERED\n" +
                 "Path: {} {}\n" +
                 "Headers: {}\n" +
                 "Query Params: {}\n" +
                 "Remote Address: {}",
                 request.getMethod(),
                 request.getPath(),
                 request.getHeaders(),
                 request.getQueryParams(),
                 request.getRemoteAddress());
        
        // Build detailed error response
        Map<String, Object> response = new LinkedHashMap<>();
        String requestId = UUID.randomUUID().toString();
        
        response.put("timestamp", Instant.now().toString());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", HttpStatus.SERVICE_UNAVAILABLE.getReasonPhrase());
        response.put("message", "Order Service is currently unavailable. Please try again later.");
        response.put("path", request.getPath().value());
        response.put("requestId", requestId);
        
        // Log the request ID for correlation
        log.error("Request ID for failed order service call: {}", requestId);
        
        return Mono.just(ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(response));
    }
    
    @RequestMapping("/fallback/inventory")
    public Mono<ResponseEntity<Map<String, Object>>> inventoryFallback(ServerWebExchange exchange) {
        var request = exchange.getRequest();
        
        log.error("\n❌ INVENTORY SERVICE FALLBACK TRIGGERED\n" +
                 "Path: {} {}\n" +
                 "Headers: {}\n" +
                 "Query Params: {}",
                 request.getMethod(),
                 request.getPath(),
                 request.getHeaders(),
                 request.getQueryParams());
        
        Map<String, Object> response = new LinkedHashMap<>();
        String requestId = UUID.randomUUID().toString();
        
        response.put("timestamp", Instant.now().toString());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", HttpStatus.SERVICE_UNAVAILABLE.getReasonPhrase());
        response.put("message", "Inventory Service is currently unavailable. Please try again later.");
        response.put("path", request.getPath().value());
        response.put("requestId", requestId);
        
        log.error("Request ID for failed inventory service call: {}", requestId);
        
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response));
    }
    
    @RequestMapping("/fallback/auth")
    public Mono<ResponseEntity<Map<String, Object>>> authFallback(ServerWebExchange exchange) {
        var request = exchange.getRequest();
        
        log.error("\n❌ AUTH SERVICE FALLBACK TRIGGERED\n" +
                 "Path: {} {}\n" +
                 "Headers: {}\n" +
                 "Query Params: {}",
                 request.getMethod(),
                 request.getPath(),
                 request.getHeaders(),
                 request.getQueryParams());
        
        Map<String, Object> response = new LinkedHashMap<>();
        String requestId = UUID.randomUUID().toString();
        
        response.put("timestamp", Instant.now().toString());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Authentication Service Unavailable");
        response.put("message", "Authentication Service is currently unavailable. Please try again later.");
        response.put("path", request.getPath().value());
        response.put("requestId", requestId);
        
        log.error("Request ID for failed auth service call: {}", requestId);
        
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response));
    }
    
    @RequestMapping("/fallback")
    public Mono<ResponseEntity<Map<String, Object>>> fallback(ServerWebExchange exchange) {
        var request = exchange.getRequest();
        
        // Log the error with request details
        log.error("\n❌ GLOBAL FALLBACK TRIGGERED\n" +
                 "Path: {} {}\n" +
                 "Headers: {}\n" +
                 "Query Params: {}",
                 request.getMethod(),
                 request.getPath(),
                 request.getHeaders(),
                 request.getQueryParams());
        
        // Build detailed error response
        Map<String, Object> response = new LinkedHashMap<>();
        String requestId = UUID.randomUUID().toString();
        
        response.put("timestamp", Instant.now().toString());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");
        response.put("message", "The requested service is currently unavailable. Please try again later.");
        response.put("path", request.getPath().value());
        response.put("requestId", requestId);
        
        log.error("Request ID for global fallback: {}", requestId);
        
        return Mono.just(ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(response));
    }
}
