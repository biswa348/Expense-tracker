package com.example.expense_tracker.repository;

import com.example.expense_tracker.entity.Budget;
import com.example.expense_tracker.entity.Category;
import com.example.expense_tracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserAndCategoryAndMonth(User user, Category category, String month);
    List<Budget> findByUserAndMonth(User user, String month);
}