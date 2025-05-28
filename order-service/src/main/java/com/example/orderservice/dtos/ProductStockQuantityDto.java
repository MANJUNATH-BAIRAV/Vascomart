package com.example.orderservice.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProductStockQuantityDto(
    @NotNull(message = "Product ID is required")
    Long productId,
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    Integer quantity
) {}
