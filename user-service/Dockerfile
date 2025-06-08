# Build stage
FROM maven:3.8.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first for better caching
RUN mvn dependency:go-offline
COPY src/ /app/src/
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre AS runtime
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 --group appuser
WORKDIR /app
COPY --from=build /app/target/*.jar /app/app.jar
RUN chown -R appuser:appuser /app
USER 1001

# JVM Options
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENV SERVER_PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${SERVER_PORT} -jar /app/app.jar"]
