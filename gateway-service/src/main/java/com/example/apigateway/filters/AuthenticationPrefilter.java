package com.example.apigateway.filters;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.function.Function;

import static com.example.apigateway.filters.CorrelationIdFilter.CORRELATION_ID;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuthenticationPrefilter
        implements GatewayFilter {

    private final org.springframework.web.reactive.function.client.WebClient.Builder webClientBuilder;

    private String getAuthServiceUrl() {
        // Use the service ID directly, load balancing will be handled by Spring Cloud
        return "http://auth-service/validate";
    }

    private Function<ResponseEntity<Void>, Mono<? extends Void>> getResponseEntityMonoFunction(
            final ServerWebExchange exchange,
            final GatewayFilterChain chain
    ) {
        return response -> {
            if (!response.getStatusCode()
                         .is2xxSuccessful()) {
                return this.onError(exchange, response.getStatusCode());
            }

            var headers = response
                    .getHeaders();

            var userId = headers.getFirst("userId");
            var username = headers.getFirst("username");

            if (username == null || userId == null) {
                return this.onError(exchange, response.getStatusCode());
            }

            // Add all necessary headers for the order service
            var requestBuilder = exchange.getRequest().mutate()
                .header("userId", userId)
                .header("username", username);

            // Preserve the original path
            String path = exchange.getRequest().getPath().value();
            if (path.startsWith("/api/v1/orders")) {
                requestBuilder.path(path);
            }

            return chain.filter(exchange.mutate()
                .request(requestBuilder.build())
                .build());
        };
    }

    private Mono<Void> onError(
            final ServerWebExchange exchange,
            final HttpStatusCode statusCode
    ) {
        var response = exchange.getResponse();
        response.setStatusCode(statusCode);
        return response.setComplete();
    }

    @Override
    public Mono<Void> filter(
            final ServerWebExchange exchange,
            final GatewayFilterChain chain
    ) {

        var headers = exchange.getRequest()
                              .getHeaders();

        var bearerToken = headers.getFirst(HttpHeaders.AUTHORIZATION);
        var correlationID = headers.getFirst(CORRELATION_ID);

        if (bearerToken == null) {
            log.error("bearerToken NULL");
            return this.onError(exchange, HttpStatus.UNAUTHORIZED);
        }
        try {
            return this.webClientBuilder.build()
                                        .post()
                                        .uri(this.getAuthServiceUrl())
                                        .header(HttpHeaders.AUTHORIZATION, bearerToken)
                                        .header(CORRELATION_ID, correlationID)
                                        .retrieve()
                                        .toBodilessEntity()
                                        .flatMap(this.getResponseEntityMonoFunction(exchange, chain))
                                        .onErrorResume(WebClientResponseException.class, e -> {
                                            log.error(e.getMessage());
                                            return this.onError(exchange, e.getStatusCode());
                                        });
        } catch (Exception e) {
            log.error(e.getMessage());
            return this.onError(exchange, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
