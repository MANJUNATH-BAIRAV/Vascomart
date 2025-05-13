package com.example.orderservice.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

@Component
public class JWTHelper {

    private static final String SECRET_KEY = "LSE1yJq4TJuIneLtE1ZjwkGITMQJrgiFFZr8vOTGCWc=";
    private static final String ISSUER = "auth-service";
    private static final String[] VALID_AUDIENCES = {"order-service", "e-commerce-store"};
    private static final String ROLE_USER = "USER";

    private static final SecretKey key = new SecretKeySpec(
            Base64.getDecoder().decode(SECRET_KEY), "HmacSHA256");

    public boolean validateToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // 🔍 Debugging output
            System.out.println("====== JWT DEBUG ======");
            System.out.println("Issuer    : " + claims.getIssuer());
            System.out.println("Audience  : " + claims.getAudience());
            System.out.println("Username  : " + claims.get("username"));
            System.out.println("User ID   : " + claims.get("userId"));
            System.out.println("Role      : " + claims.get("role"));
            System.out.println("Expiration: " + claims.getExpiration());
            System.out.println("========================");

            // ✅ Validate Issuer
            String issuer = claims.getIssuer();
            if (issuer == null || !issuer.equals(ISSUER)) {
                return false;
            }

            // ✅ Validate Audience
            String audience = claims.getAudience();
            if (audience == null || !isValidAudience(audience)) {
                return false;
            }

            // ✅ Validate Role (optional: allow more than just USER)
            String role = claims.get("role", String.class);
            if (role == null || !role.equals(ROLE_USER)) {
                return false;
            }

            // ✅ Validate Expiration
            Date expiration = claims.getExpiration();
            if (expiration != null && expiration.before(new Date())) {
                return false; // Token has expired
            }

            return true;
        } catch (JwtException e) {
            // Log the reason for failure
            System.err.println("JWT validation error: " + e.getMessage());
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.get("username", String.class);
        } catch (Exception e) {
            System.err.println("Failed to extract username from token: " + e.getMessage());
            return null;
        }
    }

    private boolean isValidAudience(String audience) {
        for (String validAudience : VALID_AUDIENCES) {
            if (validAudience.equals(audience)) {
                return true;
            }
        }
        return false;
    }
}
