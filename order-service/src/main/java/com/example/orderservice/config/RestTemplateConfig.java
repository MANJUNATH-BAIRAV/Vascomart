package com.example.orderservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;

@Configuration
@RequiredArgsConstructor
public class RestTemplateConfig {

    @Value("${inventory-service.url}")
    private String inventoryServiceUrl;

    private final ContextHolder contextHolder;
    private final RestTemplateBuilder restTemplateBuilder;

    @Bean
    public RestTemplateInterceptor restTemplateInterceptor() {
        return new RestTemplateInterceptor(this.contextHolder);
    }

    @Bean
    @Primary
    public RestTemplate getRestTemplate(RestTemplateInterceptor restTemplateInterceptor) {
        return this.restTemplateBuilder
                .interceptors(restTemplateInterceptor)
                .uriTemplateHandler(new DefaultUriBuilderFactory())
                .build();
    }

    @Bean(name = "inventoryServiceRestTemplate")
    public RestTemplate inventoryServiceRestTemplate(RestTemplateInterceptor restTemplateInterceptor) {
        RestTemplate restTemplate = this.restTemplateBuilder
                .interceptors(restTemplateInterceptor)
                .build();
        restTemplate.setUriTemplateHandler(new DefaultUriBuilderFactory(inventoryServiceUrl));
        return restTemplate;
    }
}
