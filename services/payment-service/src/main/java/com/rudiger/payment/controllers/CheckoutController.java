package com.rudiger.payment.controllers;

import com.rudiger.payment.dtos.CheckoutSessionResponse;
import com.rudiger.payment.dtos.CreateCheckoutSessionRequest;
import com.rudiger.payment.exceptions.PaymentException;
import com.rudiger.payment.services.CheckoutSessionService;
import com.rudiger.payment.services.WebhookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
public class CheckoutController {
    private final CheckoutSessionService checkoutSessionService;
    private final WebhookService webhookService;

    @PostMapping("/sessions")
    public CheckoutSessionResponse createSession(@Valid @RequestBody CreateCheckoutSessionRequest request) {
        return checkoutSessionService.createCheckoutSession(request);
    }

    @PostMapping("/webhook")
    public void handleWebhook(
            @RequestHeader Map<String, String> headers,
            @RequestBody String payload) {
        webhookService.handle(headers, payload);
    }

    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<?> handlePaymentException() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error creating a checkout session"));
    }
}
