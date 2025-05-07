package com.example.orderservice.config;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.exporter.otlp.logs.OtlpGrpcLogRecordExporter;
import io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.logs.LogRecordProcessor;
import io.opentelemetry.sdk.logs.SdkLoggerProvider;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.semconv.resource.attributes.ResourceAttributes;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class OpenTelemetryConfig {

    @Bean
    OpenTelemetry openTelemetry(
            SdkLoggerProvider sdkLoggerProvider,
            SdkTracerProvider sdkTracerProvider,
            ContextPropagators contextPropagators
    ) {
        var openTelemetrySdk = OpenTelemetrySdk.builder()
                                               .setLoggerProvider(sdkLoggerProvider)
                                               .setTracerProvider(sdkTracerProvider)
                                               .setPropagators(contextPropagators)
                                               .build();
        OpenTelemetryAppender.install(openTelemetrySdk);
        return openTelemetrySdk;
    }

    @Bean
    SdkLoggerProvider otelSdkLoggerProvider(
            Environment environment,
            ObjectProvider<LogRecordProcessor> logRecordProcessors
    ) {
        var applicationName = environment.getProperty("spring.application.name", "application");
        var springResource = Resource.create(Attributes.of(ResourceAttributes.SERVICE_NAME, applicationName));
        var builder = SdkLoggerProvider.builder()
                                       .setResource(Resource.getDefault().merge(springResource));
        logRecordProcessors.orderedStream().forEach(builder::addLogRecordProcessor);
        return builder.build();
    }


    @Bean
    LogRecordProcessor otelLogRecordProcessor() {
        return BatchLogRecordProcessor
                .builder(
                        OtlpGrpcLogRecordExporter.builder()
                                                 .setEndpoint("http://localhost:4317")
                                                 .build())
                .build();
    }

    @Bean
    public SdkTracerProvider sdkTracerProvider(Environment environment) {
        String applicationName = environment.getProperty("spring.application.name", "order-service");
        Resource resource = Resource.getDefault()
                .merge(Resource.create(Attributes.of(
                        ResourceAttributes.SERVICE_NAME, applicationName,
                        ResourceAttributes.SERVICE_VERSION, "1.0.0"
                )));

        return SdkTracerProvider.builder()
                .addSpanProcessor(SimpleSpanProcessor.create(SpanExporter.composite()))
                .setResource(resource)
                .setSampler(Sampler.alwaysOn())
                .build();
    }
    
    @Bean
    public ContextPropagators contextPropagators() {
        return ContextPropagators.create(W3CTraceContextPropagator.getInstance());
    }

}
