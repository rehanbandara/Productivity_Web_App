package com.smartcampus.smart_campus_api.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component // Spring Bean for JWT utility functions
public class JwtUtil {

    @Value("${jwt.secret}") 
    private String secret; // Secret key used to sign the token

    @Value("${jwt.expiration}")
    private long expiration; // Token expiration time (milliseconds)

    // Generate signing key from secret
    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Generate JWT token with email, role, and userId
    public String generateToken(String email, String role, Long userId) {
        return Jwts.builder()
                .setSubject(email) // main identity (username/email)
                .claim("role", role) // custom claim (role)
                .claim("userId", userId) // custom claim (user ID)
                .setIssuedAt(new Date()) // token creation time
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // expiry time
                .signWith(getKey(), SignatureAlgorithm.HS256) // sign token with secret key
                .compact(); // build token as string
    }

    // Extract email (subject) from token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Extract role from token
    public String extractRole(String token) {
        return (String) getClaims(token).get("role");
    }

    // Extract userId from token
    public Long extractUserId(String token) {
        return ((Number) getClaims(token).get("userId")).longValue();
    }

    // Validate token (checks signature and expiration)
    public boolean validateToken(String token) {
        try {
            getClaims(token); // if parsing works → token is valid
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false; // invalid or expired token
        }
    }

    // Parse token and extract all claims
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey()) // verify using same secret key
                .build()
                .parseClaimsJws(token) // parse token
                .getBody(); // return claims (data inside token)
    }
}






















/*




*/