package com.example.apigateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;

@Slf4j
@Configuration
public class RateLimiterConfig {
    
    private static final String UNKNOWN_IP = "unknown";
    private static final String X_FORWARDED_FOR_HEADER = "X-Forwarded-For";
    
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            try {
                ServerHttpRequest request = exchange.getRequest();
                return Mono.just(resolveClientIp(request));
            } catch (Exception e) {
                log.warn("Failed to resolve client IP, using 'unknown' as fallback", e);
                return Mono.just(UNKNOWN_IP);
            }
        };
    }
    
    private String resolveClientIp(ServerHttpRequest request) {
        // Try to get IP from X-Forwarded-For header first
        String xForwardedFor = request.getHeaders().getFirst(X_FORWARDED_FOR_HEADER);
        if (xForwardedFor != null && !xForwardedFor.trim().isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        // Fall back to remote address if available
        InetSocketAddress remoteAddress = request.getRemoteAddress();
        if (remoteAddress != null && remoteAddress.getAddress() != null) {
            return remoteAddress.getAddress().getHostAddress();
        }
        
        return UNKNOWN_IP;
    }
}
