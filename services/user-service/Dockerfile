FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY services/user-service/pom.xml ./
RUN mvn -q dependency:go-offline -B
COPY services/user-service/src ./src
RUN mvn -q clean package -DskipTests -B

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN addgroup --system spring && adduser --system --ingroup spring spring
COPY --from=build /app/target/*.jar app.jar
RUN chown spring:spring app.jar
USER spring
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
