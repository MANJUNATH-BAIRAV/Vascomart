package com.example.orderservice.services;

import com.example.orderservice.dtos.OrderProductCreateDto;
import com.example.orderservice.dtos.ProductDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceClient
        implements IProductServiceClient {

    @org.springframework.beans.factory.annotation.Qualifier("inventoryServiceRestTemplate")
    private final RestTemplate restTemplate;
    
    @Value("${inventory-service.url}")
    private String baseUrl;
    
    private final String PRODUCTS_BASE_PATH = "/products";

    @Override
    public Optional<ProductDto> getProductById(final Long id) {
        try {
            var url = this.baseUrl + this.PRODUCTS_BASE_PATH + "/" + id;

            org.springframework.http.ResponseEntity<ProductDto> response = this.restTemplate.getForEntity(url, ProductDto.class);
            return Optional.ofNullable(response.getBody());
        } catch (Exception ex) {
            log.error(ex.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public Map<Long, ProductDto> getProductById(final List<Long> ids) {
        try {
            var idsStringList = ids.stream()
                                   .map(String::valueOf)
                                   .collect(Collectors.joining(","));

            var url = this.baseUrl + this.PRODUCTS_BASE_PATH + "/by-ids?ids=" + idsStringList;

            org.springframework.http.ResponseEntity<ProductDto[]> response = this.restTemplate.getForEntity(url, ProductDto[].class);
            return Arrays.stream(Objects.requireNonNull(response.getBody()))
                         .collect(Collectors.toMap(ProductDto::id, productDto -> productDto));
        } catch (Exception ex) {
            log.error(ex.getMessage());
            return new HashMap<>();
        }
    }

    @Override
    public boolean updateStock(final List<OrderProductCreateDto> ids) {
        try {
            org.springframework.http.ResponseEntity<Void> response = this.restTemplate.exchange(
                    this.baseUrl + this.PRODUCTS_BASE_PATH + "/decrease-stock",
                    HttpMethod.PUT,
                    new HttpEntity<>(ids),
                    Void.class
            );

            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception ex) {
            log.error(ex.getMessage());
            return false;
        }
    }
}
