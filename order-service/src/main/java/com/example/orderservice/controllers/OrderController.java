package com.example.orderservice.controllers;

import com.example.orderservice.dtos.OrderCreateDto;
import com.example.orderservice.dtos.OrderDto;
import com.example.orderservice.services.IOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping(path = {"api/v1/orders"})
@Tag(name = "Order")
public class OrderController {

    private final IOrderService orderService;

    @Operation(
        summary = "Create a new order",
        responses = {
            @ApiResponse(responseCode = "200", content = {
                @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = OrderDto.class))
            }),
            @ApiResponse(responseCode = "400", content = {
                @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ProblemDetail.class))
            })
        }
    )
    @PostMapping("users/me")
    public ResponseEntity<OrderDto> add(
        HttpServletRequest request,
        @Valid @RequestBody OrderCreateDto orderCreateDto
    ) {
        log.info("{} - {} - {}", request.getMethod(), request.getRequestURI(), orderCreateDto);
        var orderDto = this.orderService.addOne(orderCreateDto);
        return ResponseEntity.ok(orderDto);
    }

    @Operation(
        summary = "Get an order for the current user",
        responses = {
            @ApiResponse(responseCode = "200", content = {
                @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = OrderDto.class))
            }),
            @ApiResponse(responseCode = "400", content = {
                @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ProblemDetail.class))
            })
        }
    )
    @GetMapping("users/me/{orderId}")
    public ResponseEntity<OrderDto> getOne(
        HttpServletRequest request,
        @PathVariable Long orderId
    ) {
        log.info("{} - {} - Order ID: {}", request.getMethod(), request.getRequestURI(), orderId);
        var orderDto = this.orderService.getOne(orderId);
        return ResponseEntity.ok(orderDto);
    }
}
