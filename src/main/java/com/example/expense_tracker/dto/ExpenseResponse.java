package com.example.expense_tracker.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExpenseResponse {
    private Long id;
    private Double amount;
    private String description;
    private LocalDate date;
    private Long categoryId;
    private String categoryName;
}