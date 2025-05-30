package com.example.orderservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@RequiredArgsConstructor
public class InternalServiceConfig {
    
    private final RestTemplateBuilder restTemplateBuilder;
    
    @Bean(name = "internalRestTemplate")
    public RestTemplate internalRestTemplate(RestTemplateInterceptor restTemplateInterceptor) {
        return restTemplateBuilder
                .interceptors(restTemplateInterceptor)
                .build();
    }
}
