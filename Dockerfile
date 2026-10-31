# Runtime image with Java 25 (Eclipse Temurin JRE)
FROM eclipse-temurin:25-jre

# Add Maintainer Info
LABEL maintainer="hendisantika@yahoo.co.id"

# Add a volume pointing to /tmp
VOLUME /tmp

# Make port 8080 available to the world outside this container
EXPOSE 8080

# The application's jar file
ARG JAR_FILE=target/spring-boot-wilayah-indonesia-0.0.1-SNAPSHOT.jar

# Add the application's jar to the container
COPY ${JAR_FILE} app.jar

# Run the jar file
ENTRYPOINT ["java","-Dspring.profiles.active=docker","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
