package com.example.authservice.controller;

import com.example.authservice.config.ContextHolder;
import com.example.authservice.dtos.LoginDto;
import com.example.authservice.dtos.UserDto;
import com.example.authservice.service.IAuthService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")  // Base path for auth endpoints
@RequiredArgsConstructor
@Tag(name = "Auth")
public class AuthController {

    private final IAuthService authService;
    private final ContextHolder contextHolder;

    @Operation(
        summary = "Performs the login",
        responses = {
            @ApiResponse(responseCode = "204")
        }
    )
    @PostMapping("/login")
    public ResponseEntity<Object> login(
        HttpServletRequest request,
        @Valid @RequestBody LoginDto loginDto
    ) {
        logRequest(request, loginDto);
        String jwt = authService.login(loginDto);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + jwt);

        return ResponseEntity.noContent().headers(headers).build();
    }

    @Operation(
        summary = "Register a new user",
        responses = {
            @ApiResponse(responseCode = "201", description = "User registered successfully")
        }
    )
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(
        @Valid @RequestBody UserDto userDto
    ) {
        boolean created = authService.register(userDto);
        Map<String, String> response = new HashMap<>();

        if (created) {
            response.put("message", "User registered successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            response.put("error", "User registration failed");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @Hidden
    @PostMapping("/validate")
    public ResponseEntity<Object> validateToken(
        HttpServletRequest request,
        @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader
    ) {
        logRequest(request, null);

        String token = authHeader.replace("Bearer ", "");
        var userHeader = authService.validateToken(token);

        HttpHeaders headers = new HttpHeaders();
        headers.set("userId", userHeader.id().toString());
        headers.set("username", userHeader.username());

        return ResponseEntity.ok().headers(headers).build();
    }

    private void logRequest(HttpServletRequest request, Object body) {
        log.info("{} - {} - {} - {} - {}",
            request.getMethod(),
            request.getRequestURI(),
            contextHolder.getCorrelationId(),
            contextHolder.getUsername(),
            body
        );
    }
}
