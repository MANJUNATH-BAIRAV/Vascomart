package com.example.inventoryservice.config;

import lombok.Data;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

@Data
@Component
@RequestScope
public class ContextData {

    private final String correlationId;
    private final Long userId;
    private final String username;
    
    public ContextData() {
        this.correlationId = null;
        this.userId = null;
        this.username = null;
    }
    
    public ContextData(String correlationId, Long userId, String username) {
        this.correlationId = correlationId;
        this.userId = userId;
        this.username = username;
    }
}
