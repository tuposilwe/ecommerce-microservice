package com.rudiger.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// This service authenticates by verifying JWTs and has no user store,
// so Boot's default in-memory user (and the generated password it logs
// on every start) is only noise - a SecurityFilterChain alone does not
// switch it off.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class PaymentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
    }
}
