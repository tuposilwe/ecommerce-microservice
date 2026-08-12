# Store frontend

React + TypeScript storefront for the Spring Boot API in the parent directory: product browsing, guest cart, auth, Stripe checkout, order history, and an admin product manager.

## Develop

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`. The dev server proxies `/api/*` to `http://localhost:8080` (see `vite.config.ts`), so no CORS setup is needed — make sure the Spring Boot app is running locally first (`./mvnw spring-boot:run`, `dev` profile).

The backend's `websiteUrl` (used for Stripe's success/cancel redirect) is set to `http://localhost:5173` in `application-dev.yaml` to match this dev server.

## Build

```bash
npm run build
```

Outputs to `dist/`. This is a static SPA — serve `dist/` from any static host or reverse proxy, and point API calls at your deployed backend (either via a reverse-proxy path like the dev proxy, or by adding a CORS config to the backend's `SecurityConfig` if the frontend and API are on different origins).

## Notes

- There's no `GET /products/{id}` on the backend, so the product detail page fetches the full list and finds the product client-side.
- The JWT access token is decoded client-side (not verified — verification happens server-side) purely to drive UI role checks (e.g. showing the Admin nav link). It's stored in `localStorage`.
- The refresh-token cookie the backend sets on login is `Secure`, so silent refresh via `/auth/refresh` only works over HTTPS. Locally over `http://`, sessions just expire after the access token's lifetime (15 min) and the user has to log in again.
- Cart is anonymous/guest-based (`cartId` in `localStorage`), matching the backend's `/carts/**` being `permitAll`.
