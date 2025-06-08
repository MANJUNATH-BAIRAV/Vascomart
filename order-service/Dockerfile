FROM maven:3.8.5-openjdk-17 AS build
COPY . /usr/app
WORKDIR /usr/app
RUN mvn clean package -DskipTests

FROM openjdk:17
VOLUME /tmp
ARG JAR_FILE=target/order-service-0.0.1-SNAPSHOT.jar
COPY --from=build /usr/app/${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar", "--spring.profiles.active=docker"]
EXPOSE 8080
