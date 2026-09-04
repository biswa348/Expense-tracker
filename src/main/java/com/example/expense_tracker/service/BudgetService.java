package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.BudgetDTO;
import com.example.expense_tracker.entity.Budget;
import com.example.expense_tracker.entity.Category;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.BudgetRepository;
import com.example.expense_tracker.repository.CategoryRepository;
import com.example.expense_tracker.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;

    // ===== ADD THIS METHOD HERE - THIS IS THE ONE YOU ASKED =====
    public Budget saveBudget(BudgetDTO dto, User user) {

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        final String monthYear;
        if (dto.getMonth() != null && dto.getMonth().contains("-")) {
            monthYear = dto.getMonth();
        } else {
            monthYear = YearMonth.now().toString(); // "2025-09"
        }

        Budget b = budgetRepository.findByUserAndCategoryAndMonth(user, category, monthYear)
                .orElse(Budget.builder()
                        .user(user)
                        .category(category)
                        .month(monthYear)
                        .build());

        b.setLimitAmount(dto.getLimitAmount());

        return budgetRepository.save(b);
    }

    public List<BudgetDTO> getBudgetsWithStatus(User user) {
        String currentMonth = YearMonth.now().toString();
        List<Budget> budgets = budgetRepository.findByUserAndMonth(user, currentMonth);

        YearMonth ym = YearMonth.parse(currentMonth);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        return budgets.stream().map(b -> {
            Double spent = expenseRepository.findByUserAndCategoryAndDateBetween(user, b.getCategory(), start, end)
                    .stream().mapToDouble(e -> e.getAmount()).sum();

            BudgetDTO dto = new BudgetDTO();
            dto.setCategoryId(b.getCategory().getId());
            dto.setCategoryName(b.getCategory().getName());
            dto.setLimitAmount(b.getLimitAmount());
            dto.setSpentAmount(spent);
            dto.setRemaining(b.getLimitAmount() - spent);
            dto.setMonth(b.getMonth());
            dto.setExceeded(spent > b.getLimitAmount());
            return dto;
        }).collect(Collectors.toList());
    }
}