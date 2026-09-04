package com.example.expense_tracker.dto;
import lombok.Data;
@Data
public class BudgetDTO {
    private Long categoryId;
    private String categoryName;
    private Double limitAmount;
    private Double spentAmount; // calculated
    private Double remaining;
    private String month; // 2025-09
    private boolean exceeded;
}