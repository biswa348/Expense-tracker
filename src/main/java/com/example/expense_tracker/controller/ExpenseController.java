package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.ExpenseRequest;
import com.example.expense_tracker.dto.ExpenseResponse;
import com.example.expense_tracker.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // KEEP ONLY THIS ONE POST - delete the other one
    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(@RequestBody ExpenseRequest dto) {
        return ResponseEntity.ok(expenseService.addExpense(dto));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getMyExpenses() {
        return ResponseEntity.ok(expenseService.getExpensesByUser());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/total")
    public ResponseEntity<Double> getTotal() {
        return ResponseEntity.ok(expenseService.getTotalThisMonth());
    }

    @GetMapping("/by-category")
    public ResponseEntity<Map<String, Double>> getByCategory() {
        return ResponseEntity.ok(expenseService.getCategoryWiseExpense());
    }
}