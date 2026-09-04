package com.rudiger.payment.config;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .sessionManagement(c -> c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(c -> c
                        .requestMatchers("/actuator/**").permitAll()
                        // Without this, any error inside a permitted endpoint
                        // forwards to /error, gets challenged there, and
                        // surfaces as a misleading 401 - a failing webhook
                        // would look like an auth problem instead of the
                        // signature or payload error it actually is.
                        .requestMatchers("/error").permitAll()
                        // Stripe calls this one and cannot present a JWT; it is
                        // authenticated instead by verifying the webhook
                        // signature against STRIPE_WEBHOOK_SECRET_KEY.
                        .requestMatchers(HttpMethod.POST, "/checkout/webhook").permitAll()
                        // Creating a session charges money against a real Stripe
                        // account, so it requires the caller's JWT - order-service
                        // forwards the end user's token on this hop.
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(c -> {
                    c.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED));
                    c.accessDeniedHandler((request, response, ex) -> response.setStatus(HttpStatus.FORBIDDEN.value()));
                });
        return http.build();
    }
}
