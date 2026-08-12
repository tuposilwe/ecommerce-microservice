package com.rudiger.payment.services;

import com.rudiger.payment.dtos.CheckoutSessionResponse;
import com.rudiger.payment.dtos.CreateCheckoutSessionRequest;
import com.rudiger.payment.dtos.LineItemRequest;
import com.rudiger.payment.exceptions.PaymentException;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CheckoutSessionService {
    @Value("${websiteUrl}")
    private String websiteUrl;

    public CheckoutSessionResponse createCheckoutSession(CreateCheckoutSessionRequest request) {
        try {
            var builder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(websiteUrl + "/checkout-success?orderId=" + request.getOrderId())
                    .setCancelUrl(websiteUrl + "/checkout-cancel")
                    .setPaymentIntentData(createPaymentIntentData(request.getOrderId()));

            request.getItems().forEach(item -> builder.addLineItem(createLineItem(item)));

            var session = Session.create(builder.build());
            return new CheckoutSessionResponse(session.getUrl());
        } catch (StripeException ex) {
            throw new PaymentException("Error creating a checkout session");
        }
    }

    private static SessionCreateParams.PaymentIntentData createPaymentIntentData(Long orderId) {
        return SessionCreateParams.PaymentIntentData.builder()
                .putMetadata("order_id", orderId.toString())
                .build();
    }

    private SessionCreateParams.LineItem createLineItem(LineItemRequest item) {
        return SessionCreateParams.LineItem.builder()
                .setQuantity(Long.valueOf(item.getQuantity()))
                .setPriceData(createPriceData(item))
                .build();
    }

    private SessionCreateParams.LineItem.PriceData createPriceData(LineItemRequest item) {
        return SessionCreateParams.LineItem.PriceData.builder()
                .setCurrency("usd")
                .setUnitAmountDecimal(item.getUnitPrice().multiply(BigDecimal.valueOf(100)))
                .setProductData(createProductData(item))
                .build();
    }

    private SessionCreateParams.LineItem.PriceData.ProductData createProductData(LineItemRequest item) {
        return SessionCreateParams.LineItem.PriceData.ProductData
                .builder()
                .setName(item.getProductName())
                .build();
    }
}
