package com.example.expense_tracker.repository;

import com.example.expense_tracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserAndCategoryAndDateBetween(
            com.example.expense_tracker.entity.User user,
            com.example.expense_tracker.entity.Category category,
            LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    Double sumByMonthYear(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(e.amount),0) FROM Expense e WHERE e.user.id = :userId AND e.category.id = :catId AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    Double sumByCategoryAndMonthYear(@Param("userId") Long userId, @Param("catId") Long catId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT c.name, COALESCE(SUM(e.amount),0) FROM Expense e JOIN e.category c WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year GROUP BY c.name")
    List<Object[]> groupByCategoryForMonth(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    List<Expense> findByUserId(Long userId);
}