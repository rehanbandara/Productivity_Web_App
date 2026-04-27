package com.smartcampus.smart_campus_api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component 
@RequiredArgsConstructor // generates constructor by lambok
public class JwtFilter extends OncePerRequestFilter { 

    private final JwtUtil jwtUtil; 

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Get Authorization header from incoming request
        String header = request.getHeader("Authorization");

        // Check if header exists and starts with "Bearer "
        if (header != null && header.startsWith("Bearer ")) {

            // removing prefix
            String token = header.substring(7);

            // Validate token:signature + expiration check
            if (jwtUtil.validateToken(token)) {

                /////////////////////////////
                // Extract details from token
                String email = jwtUtil.extractEmail(token);
                String role = jwtUtil.extractRole(token);
                Long userId = jwtUtil.extractUserId(token);

                // Create auth object
                var auth = new UsernamePasswordAuthenticationToken(
                        email, // user identity
                        null,  // credential 
                        List.of(new SimpleGrantedAuthority("ROLE_" + role)) 
                );

             
                auth.setDetails(userId);

           
                // Spring Security: user is authenticated
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Continue request processing 
        filterChain.doFilter(request, response);
    }
}














/*
JwtFilter intercepts every incoming request, extracts the JWT token from the Authorization header, 
validates it, and if valid, sets the authentication in Spring Security context. This allows secured
 endpoints to recognize the user.

*/