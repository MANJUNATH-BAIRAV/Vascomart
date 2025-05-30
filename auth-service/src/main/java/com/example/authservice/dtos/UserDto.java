package com.example.authservice.dtos;

import java.io.Serializable;

public record UserDto(
        Long id,
        String name,
        String lastName,
        String email,
        String username,
        String password,
        String role
)
        implements Serializable {
}