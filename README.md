# ecommerce-microservice

A microservices-based e-commerce platform: React storefront/admin frontend, a Spring Cloud Gateway edge, and six independently deployable Spring Boot services with per-service Postgres databases, Eureka service discovery, centralized config, Kafka events, and Zipkin distributed tracing.

- **Frontend**: React, TypeScript, Vite, Tailwind CSS (`frontend/`) — run separately in local dev (`cd frontend && npm run dev`); `api-gateway` has a fallback `WebFilter` to serve a built SPA from its static resources, but nothing currently builds/copies the frontend there since the Docker-based build was removed (see Known limitations)
- **Services**: Java 17, Spring Boot 3.5, Spring Cloud 2025.0, PostgreSQL, Flyway, Spring Security (JWT), Stripe, Kafka
- **Infra**: Eureka (`eureka-server`), Spring Cloud Config (`config-server`), Spring Cloud Gateway (`api-gateway`), Zipkin, Kafka (KRaft, no Zookeeper)

## Architecture

```
                        ┌─────────────┐
   browser ───────────► │ api-gateway │  :8080  (routes /api/**, serves the SPA)
                        └──────┬──────┘
              ┌────────────────┼────────────────┬───────────────┬──────────────┐
              ▼                ▼                 ▼               ▼              ▼
        user-service    catalog-service    cart-service    order-service  payment-service
          :8081             :8082             :8083           :8084          :8085
              │                │                 │               │              │
          user-db         catalog-db         cart-db         order-db        (no DB;
                                                                              Stripe is
                                                                          system of record)

  eureka-server :8761   — service registry, everything above registers with it
  config-server :8888   — serves config-repo/*.yml to every service on startup
  zipkin        :9411   — collects traces from every service (gateway → service → service)
  kafka         :9092   — payment-service publishes payment-events; order-service consumes
```

Service boundaries and why they're split this way:

- **user-service** — auth (JWT issue/refresh) + user CRUD. Owns `users`.
- **catalog-service** — products, categories, product images (stored as bytea). Owns `products`, `categories`, `product_images`.
- **cart-service** — anonymous/guest carts. Owns `carts`, `cart_items`. Calls **catalog-service** via a load-balanced `RestClient` to snapshot a product's name/price when it's added to a cart (no cross-service joins).
- **order-service** — orders + checkout initiation. Owns `orders`, `order_items` (`customer_id` is a plain `BIGINT`, no FK — `user-service` owns that data). Calls **cart-service** (fetch + clear cart) and **payment-service** (create a Stripe session) via a load-balanced `RestClient`. Consumes `payment-events` from Kafka to update order status once Stripe confirms payment.
- **payment-service** — owns the Stripe integration and webhook. Stateless (no DB — Stripe is the system of record). Publishes `payment-events` to Kafka after verifying a webhook signature, rather than calling `order-service` synchronously, since the webhook is itself an async callback from Stripe.
- **api-gateway** — Spring Cloud Gateway (reactive/WebFlux). Routes `/api/**` to the right service via Eureka (`lb://service-name`) with `StripPrefix=1`, so each service's own controllers stay unprefixed (`/products`, `/carts`, ...). Everything else falls through to the bundled React build, with a `WebFilter` that rewrites unmatched GET requests to `/index.html` so client-side routes work on direct navigation.

## Project layout

```
services/
  eureka-server/     Service registry
  config-server/     Centralized config (native/file-backed, no git repo needed)
  api-gateway/        Edge router (SPA-serving fallback exists but is currently unwired - see Known limitations)
  user-service/
  catalog-service/
  cart-service/
  order-service/
  payment-service/
config-repo/          One *.yml per service, served by config-server; application.yml holds
                       shared defaults (Eureka URL, Zipkin endpoint, Kafka bootstrap servers)
monitoring/           Prometheus scrape config + Grafana datasource/dashboard provisioning,
                       mounted into the containers by docker-compose
frontend/              React app (see frontend/README.md) — run standalone via `npm run dev`
```

Each service under `services/` is a fully independent Maven project (own `pom.xml`) — there's no parent reactor POM.

## Running

Only the infra that's genuinely painful to run locally is dockerized: Zipkin, Kafka, and the 4 per-service Postgres databases. The 8 Spring Boot services (`eureka-server`, `config-server`, `api-gateway`, and the 5 business services) run as plain local JVMs — via `mvn spring-boot:run` or your IDE's run configs — which makes debugging, breakpoints, and hot-reload straightforward.

### 1. Start infra

```bash
cp .env.example .env   # fill in JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET_KEY, POSTGRES_PASSWORD
docker compose up -d
```

This starts 9 containers: `zipkin` (:9411), `kafka` (:9092, KRaft mode), `kafka-ui` (:8090), `prometheus` (:9090), `grafana` (:3000), and `user-db`/`catalog-db`/`cart-db`/`order-db` (:5433-5436).

Kafka has two listeners: `PLAINTEXT` (advertised as `localhost:9092`, for the host-run `order-service`/`payment-service`) and `INTERNAL` (advertised as `kafka:29092`, for other containers on the compose network like `kafka-ui`) — a single listener can't correctly serve both audiences since Kafka tells clients where to reconnect via the advertised address.

### 2. Start the services locally

Order matters: `eureka-server` → `config-server` → everything else. Each service's `application.yml` already defaults to `localhost` for every dependency (config-server at `:8888`, Eureka at `:8761`, Postgres at `:5433-5436`, Kafka at `:9092`, Zipkin at `:9411`) — those defaults line up with the ports Docker Compose exposes above, so no extra config is needed for local runs.

```bash
set -a; source .env; set +a   # exports JWT_SECRET, STRIPE_SECRET_KEY, etc. for the services below

mvn -f services/eureka-server/pom.xml spring-boot:run &
mvn -f services/config-server/pom.xml spring-boot:run &
# wait for both to report "Started ...Application", then:
mvn -f services/user-service/pom.xml spring-boot:run &
mvn -f services/catalog-service/pom.xml spring-boot:run &
mvn -f services/cart-service/pom.xml spring-boot:run &
mvn -f services/order-service/pom.xml spring-boot:run &
mvn -f services/payment-service/pom.xml spring-boot:run &
mvn -f services/api-gateway/pom.xml spring-boot:run &
```

Once up:
- App: `http://localhost:8080`
- Eureka dashboard: `http://localhost:8761`
- Config server: `http://localhost:8888/{service-name}/default`
- Zipkin: `http://localhost:9411`
- Kafka UI: `http://localhost:8090`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (anonymous admin, no login)
- Each service is also exposed directly on its own port (8081-8085) for debugging.

## API

The gateway strips `/api` before forwarding, so paths below are as seen by the browser (i.e. through the gateway) — each service's own controllers are mapped without the prefix.

| Method | Path | Routed to | Auth | Notes |
|---|---|---|---|---|
| GET | `/api/products` | catalog-service | public | optional `?categoryId=` filter |
| GET | `/api/products/{id}` | catalog-service | public | used internally by cart-service too |
| POST/PUT/DELETE | `/api/products/**` | catalog-service | `ADMIN` | |
| GET/POST/DELETE | `/api/products/{id}/image` | catalog-service | public / `ADMIN` | multipart upload, stored in Postgres |
| GET | `/api/categories` | catalog-service | public | |
| POST | `/api/users` | user-service | public | register |
| POST | `/api/auth/login` | user-service | public | returns a JWT + sets a refresh cookie |
| GET | `/api/auth/me` | user-service | user | |
| POST/GET/PUT/DELETE | `/api/carts/**` | cart-service | public | anonymous cart, keyed by cart UUID |
| GET | `/api/orders`, `/api/orders/{id}` | order-service | user | current user's own orders |
| POST | `/api/checkout` | order-service | user | builds the order, then calls payment-service internally |
| POST | `/api/checkout/webhook` | payment-service | public | Stripe webhook, verified via signature, publishes to Kafka |

Each service also exposes Swagger/OpenAPI or at least `/actuator/health` directly on its own port for debugging (e.g. `http://localhost:8082/actuator/health` for catalog-service).

## Events (Kafka)

`payment-service` publishes to the `payment-events` topic after verifying a Stripe webhook signature:

```json
{ "orderId": 123, "status": "PAID" }
```

`order-service` consumes it and updates the order's status. This is the one genuinely asynchronous hop in the system — everything else is synchronous REST via a load-balanced `RestClient`, which is appropriate since the webhook itself is already an async callback from Stripe.

Inter-service calls (`cart-service` → `catalog-service`, `order-service` → `cart-service`/`payment-service`) go through a `@LoadBalanced RestClient.Builder` bean (`config/RestClientConfig.java` in each service) with a plain `http://<service-name>` base URL — Spring Cloud LoadBalancer resolves the service name to a live instance via Eureka, the same registry `api-gateway` uses for its `lb://` routes.

## Tracing (Zipkin)

Every service (including the gateway) ships `micrometer-tracing-bridge-brave` + `zipkin-reporter-brave`, sampling 100% of requests (`config-repo/application.yml`). Because each `RestClient.Builder` is built via `RestClientBuilderConfigurer.configure(...)`, it inherits Boot's default HTTP client observation instrumentation, so trace context propagates across service calls automatically — no extra dependency needed (this replaced `feign-micrometer`, which the old Feign-based clients required for the same thing). Open `http://localhost:9411`, search by service, and a checkout request shows as one trace spanning `api-gateway → order-service → cart-service` and `order-service → payment-service`.

## Metrics (Prometheus + Grafana)

Every service exposes `/actuator/prometheus` via `micrometer-registry-prometheus`, and each metric is tagged with `application=<service name>` (`config-repo/application.yml`), so a single Prometheus job scrapes all eight and results still break down per service.

Because the services run as host JVMs while Prometheus runs in a container, the scrape targets are `host.docker.internal:<port>` rather than compose service names (`monitoring/prometheus/prometheus.yml`). Each target also carries an explicit `service` label, so `up{service="order-service"}` still identifies a service while it's down — a stopped app exports no metrics of its own, tags included.

Grafana is provisioned from files (`monitoring/grafana/provisioning/`): the Prometheus datasource and an "Ecommerce services" dashboard with request rate, 5xx error rate, p95 latency, and JVM heap, plus an up/down tile per service. Series colors are pinned per service name rather than assigned by query order, so a service keeps its color when others drop out of a result. Anonymous access is enabled — this stack is local-only, so don't expose it as-is.

## Database migrations

Each service manages its own schema via Flyway, in its own `services/<name>/src/main/resources/db/migration/`, applied automatically on startup against its own database.

## Known limitations

- `payment-service`'s checkout-session endpoint and Stripe webhook are not independently authenticated beyond network placement — real deployments would want mTLS or a shared internal-only network segment between services.
- No circuit breaking / retry policy on the inter-service `RestClient` calls (`cart-service` → `catalog-service`, `order-service` → `cart-service`/`payment-service`) — a downstream outage currently surfaces as a plain 5xx rather than degrading gracefully.
- `config-server` uses the `native` (local file) profile against `config-repo/`, not a git-backed repo — fine for this project, but real multi-environment setups usually point Config Server at an actual git remote for versioned, promotable config.
- No Dockerfiles exist anymore for the 8 Spring Boot services (removed along with the Docker-based deployment path — see "Running" above). This also means `api-gateway`'s SPA-serving fallback (`WebFilter` → `index.html`) has nothing to serve: the frontend build is no longer copied into its static resources by anything. Run the frontend standalone (`cd frontend && npm run dev`) for local dev instead.
