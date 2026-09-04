package com.example.expense_tracker.service;

import com.example.expense_tracker.dto.CategoryDTO;
import com.example.expense_tracker.entity.Category;
import com.example.expense_tracker.entity.User;
import com.example.expense_tracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepo;

    // CREATE category - this was missing, that's why controller was red
    public CategoryDTO create(CategoryDTO dto, User user) {
        Category cat = Category.builder()
                .name(dto.getName())
                .user(user)
                .build();
        Category saved = categoryRepo.save(cat);

        CategoryDTO result = new CategoryDTO();
        result.setId(saved.getId());
        result.setName(saved.getName());
        return result;
    }

    // GET all categories for logged-in user
    public List<CategoryDTO> getCategories(User user) {
        return categoryRepo.findByUser(user).stream().map(c -> {
            CategoryDTO d = new CategoryDTO();
            d.setId(c.getId());
            d.setName(c.getName());
            return d;
        }).collect(Collectors.toList());
    }

    // Alias methods so your controller never goes red again
    public List<CategoryDTO> getAll(User user) {
        return getCategories(user);
    }

    public List<CategoryDTO> getCategoriesByUser(User user) {
        return getCategories(user);
    }

    public List<CategoryDTO> getAll() {
        return categoryRepo.findAll().stream().map(c -> {
            CategoryDTO d = new CategoryDTO();
            d.setId(c.getId());
            d.setName(c.getName());
            return d;
        }).collect(Collectors.toList());
    }
}