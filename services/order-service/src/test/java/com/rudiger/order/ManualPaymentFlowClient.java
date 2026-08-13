package com.rudiger.order;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Manual smoke test for the checkout/payment flow, driven through api-gateway
 * with Spring's RestClient instead of curl/Postman. Not a JUnit test - run it
 * directly from the IDE (it needs the whole stack up: infra + all 8 services,
 * see docs/run-and-test-payment-guide.pdf). With the dummy Stripe key from
 * .env.example, checkout fails at the Stripe API call by design (see the
 * guide's "quick sanity check" section) - put real test-mode keys in .env to
 * get back an actual Stripe checkoutUrl to pay through.
 */
public class ManualPaymentFlowClient {

    private static final RestClient client = RestClient.create("http://localhost:8080");

    public static void main(String[] args) {
        String email = "resttest%d@example.com".formatted(System.currentTimeMillis());
        String password = "password123";

        var registered = client.post()
                .uri("/api/users")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(Map.of("name", "Rest Client Test", "email", email, "password", password))
                .retrieve()
                .body(JsonNode.class);
        System.out.println("Registered: " + registered);

        var login = client.post()
                .uri("/api/auth/login")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(Map.of("email", email, "password", password))
                .retrieve()
                .body(JsonNode.class);
        String token = login.get("token").asText();
        System.out.println("Logged in, token: " + token.substring(0, 15) + "...");

        var products = client.get()
                .uri("/api/products")
                .retrieve()
                .body(JsonNode.class);
        long productId = products.get(0).get("id").asLong();
        System.out.println("Using product: " + products.get(0));

        var cart = client.post()
                .uri("/api/carts")
                .retrieve()
                .body(JsonNode.class);
        String cartId = cart.get("id").asText();
        System.out.println("Created cart: " + cartId);

        var added = client.post()
                .uri("/api/carts/{cartId}/items", cartId)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(Map.of("productId", productId))
                .retrieve()
                .body(JsonNode.class);
        System.out.println("Added item: " + added);

        var checkout = client.post()
                .uri("/api/checkout")
                .header("Authorization", "Bearer " + token)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(Map.of("cartId", cartId))
                .retrieve()
                .body(JsonNode.class);
        System.out.println("Checkout result: " + checkout);

        if (checkout.has("checkoutUrl")) {
            System.out.println();
            System.out.println("Open this URL to pay with a Stripe test card (4242 4242 4242 4242):");
            System.out.println(checkout.get("checkoutUrl").asText());
        }
    }
}
