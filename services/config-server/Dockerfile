FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY services/config-server/pom.xml ./
RUN mvn -q dependency:go-offline -B
COPY services/config-server/src ./src
RUN mvn -q clean package -DskipTests -B

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN addgroup --system spring && adduser --system --ingroup spring spring
COPY --from=build /app/target/*.jar app.jar
COPY config-repo /config-repo
RUN chown -R spring:spring /app /config-repo
USER spring
ENV CONFIG_REPO_PATH=/config-repo
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]
