package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.CategoryDTO;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.UserRepository;
import com.example.expense_tracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final UserRepository userRepository; // <-- ADD THIS

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CategoryDTO dto, Authentication authentication) {
        String email = authentication.getName(); // get email from token
        User user = userRepository.findByEmail(email) // <-- fetch real user from DB
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(categoryService.create(dto, user));
    }

    @GetMapping
    public ResponseEntity<?> getAll(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(categoryService.getCategories(user));
    }
}