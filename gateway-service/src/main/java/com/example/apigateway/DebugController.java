package com.example.apigateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
public class DebugController {

    @GetMapping("/debug-check")
    public String testRoute() {
        log.info("Debug check endpoint called");
        return "Gateway Debug Controller is alive!";
    }

    @RequestMapping("/**")
    public Mono<ResponseEntity<Map<String, Object>>> handleUnmatchedRoutes(ServerWebExchange exchange) {
        var request = exchange.getRequest();
        
        // Build debug info
        Map<String, Object> debugInfo = new LinkedHashMap<>();
        debugInfo.put("timestamp", java.time.Instant.now().toString());
        debugInfo.put("status", 404);
        debugInfo.put("error", "Route Not Found");
        debugInfo.put("path", request.getPath().value());
        debugInfo.put("method", request.getMethod().name());
        debugInfo.put("queryParams", request.getQueryParams().toSingleValueMap());
        
        // Log detailed error
        log.error("\n❌ UNMATCHED REQUEST DETECTED ❌\n" +
                 "Path: {} {}\n" +
                 "Query: {}\n" +
                 "Headers: {}\n" +
                 "\nTROUBLESHOOTING TIPS:\n" +
                 "1. Check if the service is registered in Eureka\n" +
                 "2. Verify the path is correct (case-sensitive)\n" +
                 "3. Check if the HTTP method matches\n" +
                 "4. Verify any path/query parameters",
                 request.getMethod().name(),
                 request.getPath(),
                 request.getQueryParams(),
                 request.getHeaders().entrySet().stream()
                     .collect(Collectors.toMap(
                         Map.Entry::getKey,
                         e -> String.join(", ", e.getValue())
                     ))
        );
        
        return Mono.just(ResponseEntity
            .status(404)
            .header("X-Gateway-Debug", "true")
            .body(debugInfo));
    }
}
