package com.example.expense_tracker.service;

import com.example.expense_tracker.entity.Budget;
import com.example.expense_tracker.entity.Category;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.BudgetRepository;
import com.example.expense_tracker.repository.CategoryRepository;
import com.example.expense_tracker.repository.ExpenseRepository;
import com.example.expense_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final CategoryRepository categoryRepo;
    private final BudgetRepository budgetRepo;
    private final ExpenseRepository expenseRepo;
    private final UserRepository userRepo;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ===== 1. Budget Status for a single Category =====
    public Map<String, Object> getBudgetStatus(Long categoryId) {
        User user = getCurrentUser();

        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        String monthYear = YearMonth.now().toString(); // "2026-09"
        int monthInt = YearMonth.now().getMonthValue();
        int yearInt = YearMonth.now().getYear();

        Optional<Budget> budgetOpt = budgetRepo.findByUserAndCategoryAndMonth(user, category, monthYear);
        Double total = expenseRepo.sumByCategoryAndMonthYear(user.getId(), category.getId(), monthInt, yearInt);
        if (total == null) total = 0.0;

        Map<String, Object> map = new HashMap<>();
        if (budgetOpt.isEmpty()) {
            map.put("budgetSet", false);
            map.put("category", category.getName());
            map.put("totalSpent", total);
            map.put("limit", 0);
            map.put("remaining", 0);
            map.put("percentUsed", 0);
            map.put("message", "No budget set for " + category.getName());
            return map;
        }

        Budget b = budgetOpt.get();
        double percent = b.getLimitAmount() > 0? (total / b.getLimitAmount()) * 100 : 0;

        map.put("budgetSet", true);
        map.put("category", category.getName());
        map.put("limit", b.getLimitAmount());
        map.put("totalSpent", total);
        map.put("remaining", b.getLimitAmount() - total);
        map.put("percentUsed", percent);
        map.put("alert", percent >= 100? "OVER BUDGET!" : percent >= 80? "80% used" : "Under control");
        return map;
    }

    // ===== 2. Category wise pie chart data =====
    public Map<String, Double> getCategoryWiseExpense() {
        User user = getCurrentUser();
        YearMonth ym = YearMonth.now();

        List<Object[]> byCategoryRaw = expenseRepo.groupByCategoryForMonth(
                user.getId(), ym.getMonthValue(), ym.getYear()
        );

        Map<String, Double> byCategory = new LinkedHashMap<>();
        if (byCategoryRaw!= null) {
            for (Object[] row : byCategoryRaw) {
                if (row!= null && row.length >= 2) {
                    String catName = String.valueOf(row[0]);
                    Double sum = row[1]!= null? ((Number) row[1]).doubleValue() : 0.0;
                    byCategory.put(catName, sum);
                }
            }
        }
        return byCategory;
    }

    // ===== 3. Total spent this month =====
    public Double getTotalThisMonth() {
        User user = getCurrentUser();
        YearMonth ym = YearMonth.now();
        Double total = expenseRepo.sumByMonthYear(user.getId(), ym.getMonthValue(), ym.getYear());
        return total!= null? total : 0.0;
    }

    // ===== 4. Full Monthly Report for Dashboard =====
    public Map<String, Object> getMonthlyReport() {
        User user = getCurrentUser();
        YearMonth ym = YearMonth.now();
        String monthYear = ym.toString();

        Double total = getTotalThisMonth();
        Map<String, Double> byCategory = getCategoryWiseExpense();
        List<Budget> budgets = budgetRepo.findByUserAndMonth(user, monthYear);

        Map<String, Object> report = new HashMap<>();
        report.put("month", monthYear);
        report.put("totalSpent", total);
        report.put("byCategory", byCategory);
        report.put("budgets", budgets);
        return report;
    }

    // ===== 5. Budget vs Actual for ALL categories =====
    public List<Map<String, Object>> getBudgetOverviewForCurrentMonth() {
        User user = getCurrentUser();
        String monthYear = YearMonth.now().toString();
        List<Budget> budgets = budgetRepo.findByUserAndMonth(user, monthYear);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Budget b : budgets) {
            result.add(getBudgetStatus(b.getCategory().getId()));
        }
        return result;
    }

    public Map<String, Object> getMonthlyReport(int month, int year) {
        User user = getCurrentUser();

        int monthInt = month;
        int yearInt = year;

        // If 0 passed, use current month
        if (monthInt <= 0 || yearInt <= 0) {
            YearMonth ym = YearMonth.now();
            monthInt = ym.getMonthValue();
            yearInt = ym.getYear();
        }

        String monthYearStr = YearMonth.of(yearInt, monthInt).toString(); // "2026-09"

        // 1. Total
        Double total = expenseRepo.sumByMonthYear(user.getId(), monthInt, yearInt);
        if (total == null) total = 0.0;

        // 2. Group by category
        List<Object[]> byCategoryRaw = expenseRepo.groupByCategoryForMonth(user.getId(), monthInt, yearInt);
        Map<String, Double> byCategory = new LinkedHashMap<>();
        if (byCategoryRaw!= null) {
            for (Object[] row : byCategoryRaw) {
                String catName = String.valueOf(row[0]);
                Double sum = row[1]!= null? ((Number) row[1]).doubleValue() : 0.0;
                byCategory.put(catName, sum);
            }
        }

        // 3. Budgets
        List<Budget> budgets = budgetRepo.findByUserAndMonth(user, monthYearStr);

        // 4. Final map
        Map<String, Object> report = new HashMap<>();
        report.put("month", monthYearStr);
        report.put("totalSpent", total);
        report.put("byCategory", byCategory);
        report.put("budgets", budgets);

        return report;
    }
}