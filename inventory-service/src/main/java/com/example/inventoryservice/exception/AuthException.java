package com.example.inventoryservice.exception;

import org.springframework.http.HttpStatus;

public class AuthException extends RuntimeException {
    private final HttpStatus status;

    public AuthException(HttpStatus status) {
        super("Authentication failed");
        this.status = status;
    }

    public AuthException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
