package com.example.expense_tracker.controller;
import com.example.expense_tracker.dto.*; import com.example.expense_tracker.service.AuthService;
import lombok.RequiredArgsConstructor; import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*; import java.util.Map;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register") public ResponseEntity<?> register(@RequestBody RegisterRequest req) { String token = authService.register(req); return ResponseEntity.ok(Map.of("token", token)); }
    @PostMapping("/login") public ResponseEntity<?> login(@RequestBody LoginRequest req) { String token = authService.login(req); return ResponseEntity.ok(Map.of("token", token)); }
}