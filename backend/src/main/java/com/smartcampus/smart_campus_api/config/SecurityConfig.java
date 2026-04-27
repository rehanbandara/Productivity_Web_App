package com.smartcampus.smart_campus_api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration // Marks this as configuration class
@EnableWebSecurity // Enables Spring Security
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter; // Custom JWT filter
    private final OAuth2SuccessHandler oAuth2SuccessHandler; // OAuth handler

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http

                // Enable CORS (allow frontend to call backend)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disable CSRF (not needed for stateless APIs)
                .csrf(csrf -> csrf.disable())

                // Make session stateless (JWT-based auth)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // Public endpoints (no authentication needed)
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/tickets/attachments/*/file").permitAll()

                        // OAuth endpoints
                        .requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll()

                        // Public resources
                        .requestMatchers("/api/resources/**").permitAll()

                        // ADMIN-only endpoints
                        .requestMatchers("/api/v1/users/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/*/role").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/*").hasRole("ADMIN")

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                // OAuth2 login configuration
                .oauth2Login(oauth -> oauth
                        .successHandler(oAuth2SuccessHandler) // Custom success handler
                )

                // Add JWT filter before default auth filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Password encoder for hashing passwords
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS configuration (allow frontend access)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow frontend origin
        config.setAllowedOrigins(List.of("http://localhost:5173"));

        // Allowed HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));

        // Allow all headers
        config.setAllowedHeaders(List.of("*"));

        // Allow cookies/auth headers
        config.setAllowCredentials(true);

        CorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        ((UrlBasedCorsConfigurationSource) source).registerCorsConfiguration("/**", config);

        return source;
    }
}








/*

SecurityConfig defines how the application is secured. It disables sessions, 
uses JWT for authentication, defines public and protected endpoints, 
integrates OAuth2 login, and adds a custom JWT filter to validate requests.

*/