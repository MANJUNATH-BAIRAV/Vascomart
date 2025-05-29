package com.example.apigateway;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class DebugController {

    // Catch-all GET requests for debugging routing issues
    @GetMapping("/**")
    public ResponseEntity<String> handleAllGetRequests(HttpServletRequest request) {
        String path = request.getRequestURI();
        System.out.println("🔍 DEBUG - GATEWAY received GET request at: " + path);
        return ResponseEntity.status(404).body("GET route not found in gateway: " + path);
    }

    // Catch-all POST requests for debugging routing issues
    @PostMapping("/**")
    public ResponseEntity<String> handleAllPostRequests(HttpServletRequest request) {
        String path = request.getRequestURI();
        System.out.println("🔍 DEBUG - GATEWAY received POST request at: " + path);
        return ResponseEntity.status(404).body("POST route not found in gateway: " + path);
    }

    // You can add PUT, DELETE, etc. similarly if needed
}
