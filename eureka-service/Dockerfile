# Build stage
FROM maven:3.8.5-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only the pom.xml first to leverage Docker cache
COPY pom.xml .

# Download all dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Final stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/eureka-service-*.jar app.jar

# Expose the application port
EXPOSE 8761

# Set JVM options for better performance
ENV JAVA_OPTS="-Xms128m -Xmx256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:ParallelGCThreads=2 -XX:ConcGCThreads=2"

# Set active Spring profile to 'docker'
ENV SPRING_PROFILES_ACTIVE=docker

# Run the application with JVM options
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8761/actuator/health || exit 1
