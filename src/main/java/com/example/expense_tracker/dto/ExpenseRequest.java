package com.example.expense_tracker.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ExpenseRequest {
    private String title;
    private Double amount;
    private LocalDate date;
    private String notes;
    private Long categoryId;
    private String description;


}
