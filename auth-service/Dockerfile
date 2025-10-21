FROM maven:3.8.5-openjdk-17 AS build
COPY . /usr/app
WORKDIR /usr/app
RUN mvn clean package -DskipTests

FROM openjdk:17
VOLUME /tmp
COPY --from=build /usr/app/target/auth-service-*.jar auth-service.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "/auth-service.jar"]
