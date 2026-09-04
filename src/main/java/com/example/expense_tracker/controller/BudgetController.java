package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.BudgetDTO;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.UserRepository;
import com.example.expense_tracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BudgetController {
    private final BudgetService budgetService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> setBudget(@RequestBody BudgetDTO dto, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(budgetService.saveBudget(dto, user));
    }

    @GetMapping
    public ResponseEntity<?> getBudgets(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(budgetService.getBudgetsWithStatus(user));
    }
}