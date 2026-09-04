package com.example.expense_tracker.controller;
import com.example.expense_tracker.dto.BudgetDTO; import com.example.expense_tracker.entity.Budget;
import com.example.expense_tracker.entity.Category;
import com.example.expense_tracker.entity.User; import com.example.expense_tracker.repository.BudgetRepository;
import com.example.expense_tracker.repository.CategoryRepository;
import com.example.expense_tracker.repository.UserRepository;
import com.example.expense_tracker.service.BudgetService;
import com.example.expense_tracker.service.ReportService;
import lombok.RequiredArgsConstructor; import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.web.bind.annotation.*; import java.util.Map;
@RestController @RequestMapping("/api/reports") @RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;
    private final BudgetRepository budgetRepo;
    private final UserRepository userRepo;
    private final UserRepository userRepository;
    private final BudgetService budgetService;
    private final CategoryRepository categoryRepo;
    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyReport(@RequestParam int month, @RequestParam int year) {
        Map<String, Object> report = reportService.getMonthlyReport(month, year);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/budget-status")
    public ResponseEntity<?> budgetStatus(
            @RequestParam int month,
            @RequestParam int year,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String monthStr = String.format("%d-%02d", year, month); // 2025 + 9 -> "2025-09"

;
        return ResponseEntity.ok(budgetService.getBudgetsWithStatus(user));
    }
    @PostMapping("/budget")
    public ResponseEntity<?> setBudget(@RequestBody BudgetDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Fetch Category from dto
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // 2. Current month "2026-09"
        final String monthYear = java.time.YearMonth.now().toString();

        // 3. Find existing or create new
        Budget b = budgetRepo.findByUserAndCategoryAndMonth(user, category, monthYear)
                .orElse(null);

        if (b == null) {
            b = new Budget();
            b.setUser(user);
            b.setCategory(category);
            b.setMonth(monthYear);
        }

        // 4. THIS LINE YOU MISSED - set amount
        b.setLimitAmount(dto.getLimitAmount());

        Budget saved = budgetRepo.save(b);
        return ResponseEntity.ok(saved);
    }
}