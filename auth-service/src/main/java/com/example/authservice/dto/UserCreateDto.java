package com.example.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.io.Serializable;

@Builder
public record UserCreateDto(
        @NotNull @NotEmpty @NotBlank
        String name,
        
        @NotNull @Email
        String email,
        
        @NotNull @Size(min = 4) @NotEmpty @NotBlank
        String username,
        
        @NotNull @Size(min = 10) @NotEmpty @NotBlank
        String password
) implements Serializable {
}
