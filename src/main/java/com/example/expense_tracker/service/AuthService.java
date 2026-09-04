package com.example.expense_tracker.service;
import com.example.expense_tracker.dto.*;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.UserRepository;
import com.example.expense_tracker.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo; private final PasswordEncoder encoder; private final JwtUtil jwtUtil; private final AuthenticationManager authManager;
    public String register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) throw new RuntimeException("Email already exists");
        User user = User.builder().name(req.getName()).email(req.getEmail()).password(encoder.encode(req.getPassword())).build();
        userRepo.save(user); return jwtUtil.generateToken(user.getEmail());
    }
    public String login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        return jwtUtil.generateToken(req.getEmail());
    }
}