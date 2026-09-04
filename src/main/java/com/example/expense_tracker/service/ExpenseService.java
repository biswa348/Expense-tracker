package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.ExpenseRequest;
import com.example.expense_tracker.dto.ExpenseResponse;
import com.example.expense_tracker.entity.Category;
import com.example.expense_tracker.entity.Expense;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.CategoryRepository;
import com.example.expense_tracker.repository.ExpenseRepository;
import com.example.expense_tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepo;
    private final UserRepository userRepo;
    private final CategoryRepository categoryRepo;


    public Map<String, Double> getCategoryWiseExpense() {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        YearMonth ym = YearMonth.now();
        int monthInt = ym.getMonthValue();
        int yearInt = ym.getYear();

        List<Object[]> byCategoryRaw = expenseRepo.groupByCategoryForMonth(user.getId(), monthInt, yearInt);

        Map<String, Double> byCategory = new LinkedHashMap<>();
        if (byCategoryRaw != null) {
            for (Object[] row : byCategoryRaw) {
                if (row != null && row.length >= 2) {
                    String catName = String.valueOf(row[0]);
                    Double sum = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                    byCategory.put(catName, sum);
                }
            }
        }
        return byCategory;
    }

    public Double getTotalThisMonth() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(email).orElseThrow();
        YearMonth ym = YearMonth.now();
        Double total = expenseRepo.sumByMonthYear(user.getId(), ym.getMonthValue(), ym.getYear());
        return total != null ? total : 0.0;
    }


    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    public List<ExpenseResponse> getExpensesByUser() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepo.findByUserId(user.getId());

        return expenses.stream().map(e -> ExpenseResponse.builder()
                .id(e.getId())
                .amount(e.getAmount())
                .description(e.getDescription())
                .date(e.getDate())
                .categoryId(e.getCategory().getId())
                .categoryName(e.getCategory().getName())
                .build()
        ).toList();
    }

    public ExpenseResponse addExpense(ExpenseRequest dto) {
        User user = getCurrentUser();
        Category category = categoryRepo.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Expense expense = Expense.builder()
                .user(user)
                .category(category)
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .date(dto.getDate())
                .build();

        Expense saved = expenseRepo.save(expense);

        return ExpenseResponse.builder()
                .id(saved.getId())
                .amount(saved.getAmount())
                .description(saved.getDescription())
                .date(saved.getDate())
                .categoryId(saved.getCategory().getId())
                .categoryName(saved.getCategory().getName())
                .build();
    }
    public void deleteExpense(Long id) {
        User currentUser = getCurrentUser();

        Expense expense = expenseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id " + id));

        // security check - user can delete only his own expense
        if (!expense.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You cannot delete others expense");
        }

        expenseRepo.delete(expense);
    }
}