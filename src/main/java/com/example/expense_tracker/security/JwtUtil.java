package com.example.expense_tracker.security;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key; import java.util.Date;
@Component public class JwtUtil {
    private final Key key;
    private final long expiration;
    public JwtUtil(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration}") long expiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes()); this.expiration = expiration;
    }
    public String generateToken(String email) {
        return Jwts.builder().setSubject(email).setIssuedAt(new Date()).setExpiration(new Date(System.currentTimeMillis() + expiration)).signWith(key, SignatureAlgorithm.HS256).compact();
    }
    public String extractEmail(String token) { return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject(); }
    public boolean isValid(String token) { try { Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token); return true; } catch (JwtException e) { return false; } }
}