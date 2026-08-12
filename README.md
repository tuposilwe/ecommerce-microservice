# Store

A Spring Boot REST API for an online store, with a React storefront and admin panel.

- **Backend**: Java 17, Spring Boot 3.5, PostgreSQL, Flyway, Spring Security (JWT), Stripe Checkout
- **Frontend**: React, TypeScript, Vite, Tailwind CSS (in `frontend/`)

## Features

- Product catalog with categories
- Guest cart (no login required to add items)
- JWT auth: register, login, role-based access (`USER` / `ADMIN`)
- Stripe-hosted checkout, with a webhook to reconcile order status
- Order history per user
- Admin product management (create/edit/delete)

## Project layout

```
src/main/java/com/rudiger/store/
  controllers/    REST controllers (JSON APIs)
  entities/       JPA entities
  dtos/           Request/response payloads
  mappers/        MapStruct entity <-> DTO mappers
  services/       Business logic (auth, cart, checkout, JWT)
  config/         Security, JWT, and web (SPA-serving) config
  payments/       Stripe integration
  repositories/   Spring Data repositories

src/main/resources/
  application*.yaml       Config (base / dev / prod profiles)
  db/migration/            Flyway SQL migrations

frontend/                  React app (see frontend/README.md)
```

## Running locally (without Docker)

Requires a local PostgreSQL instance. The `dev` profile (active by default) expects one at `localhost:5433`, database `store_api`, user `postgres` — see `application-dev.yaml`. Easiest way to get that:

```bash
docker run -d --name store-postgres -p 5433:5432 \
  -e POSTGRES_PASSWORD=5396rudiger -e POSTGRES_DB=store_api postgres:16-alpine
```

Create a `.env` file at the project root (see `.env.example`) with `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET_KEY` — the app loads it automatically via `spring-dotenv`.

Then, in two terminals:

```bash
# backend — runs on :8080, applies Flyway migrations on startup
./mvnw spring-boot:run

# frontend — runs on :5173, proxies /api/** to the backend
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Running with Docker

`Dockerfile` is a single multi-stage build: it builds the React app, embeds the output into the Spring Boot jar's static resources, and packages one runnable image. There's no separate frontend container — the backend serves both the API (under `/api/**`) and the SPA (everything else) from the same origin.

```bash
docker compose up --build
```

This starts the app (`:8080`) and a Postgres container. Configure secrets via a `.env` file (copy `.env.example`) — `docker compose` reads it automatically. `WEBSITE_URL` should be the public origin the container is reached at (used for Stripe's checkout redirect); it defaults to `http://localhost:8080`.

## API

All API routes are under `/api`. Interactive docs (Swagger UI) are available at `/swagger-ui/index.html` once the app is running.

Notable endpoints:

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/products` | public | optional `?categoryId=` filter |
| POST/PUT/DELETE | `/api/products/**` | `ADMIN` | |
| GET | `/api/products/{id}/image` | public | 404 if no image uploaded |
| POST | `/api/products/{id}/image` | `ADMIN` | multipart upload, stored in Postgres |
| DELETE | `/api/products/{id}/image` | `ADMIN` | |
| GET | `/api/categories` | public | |
| POST | `/api/users` | public | register |
| POST | `/api/auth/login` | public | returns a JWT + sets a refresh cookie |
| GET | `/api/auth/me` | user | |
| POST/GET/PUT/DELETE | `/api/carts/**` | public | anonymous cart, keyed by cart UUID |
| GET | `/api/orders`, `/api/orders/{id}` | user | current user's own orders |
| POST | `/api/checkout` | user | creates a Stripe Checkout session |
| POST | `/api/checkout/webhook` | public | Stripe webhook, verified via signature |

## Database migrations

Managed by Flyway (`src/main/resources/db/migration/`), applied automatically on application startup. To run them manually against the dev database:

```bash
./mvnw flyway:migrate
```
