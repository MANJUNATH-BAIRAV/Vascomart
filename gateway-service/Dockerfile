# Build stage
FROM maven:3.8.5-openjdk-17 AS build
COPY . /usr/app
WORKDIR /usr/app
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:17
COPY --from=build /usr/app/target/*.jar /api-gateway.jar
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /api-gateway.jar"]
EXPOSE 8080