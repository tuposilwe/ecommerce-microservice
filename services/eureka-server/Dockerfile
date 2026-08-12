FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY services/eureka-server/pom.xml ./
RUN mvn -q dependency:go-offline -B
COPY services/eureka-server/src ./src
RUN mvn -q clean package -DskipTests -B

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN addgroup --system spring && adduser --system --ingroup spring spring
COPY --from=build /app/target/*.jar app.jar
RUN chown spring:spring app.jar
USER spring
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
