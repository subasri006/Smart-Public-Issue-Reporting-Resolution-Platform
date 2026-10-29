package com.civicfix.service;

import com.civicfix.dto.CategoryRequest;
import com.civicfix.dto.CategoryResponse;
import com.civicfix.entity.ComplaintCategory;
import com.civicfix.entity.User;
import com.civicfix.exception.BadRequestException;
import com.civicfix.exception.ResourceNotFoundException;
import com.civicfix.repository.ComplaintCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final ComplaintCategoryRepository categoryRepository;
    private final AuditService auditService;
    private final AuthService authService;

    public CategoryService(ComplaintCategoryRepository categoryRepository, AuditService auditService, AuthService authService) {
        this.categoryRepository = categoryRepository;
        this.auditService = auditService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(boolean onlyActive) {
        List<ComplaintCategory> list = onlyActive ? categoryRepository.findByActiveTrueOrderByNameAsc() : categoryRepository.findAll();
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        ComplaintCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }
        if (categoryRepository.existsByCodeIgnoreCase(request.getCode().trim())) {
            throw new BadRequestException("Category with code '" + request.getCode() + "' already exists");
        }

        ComplaintCategory category = new ComplaintCategory();
        category.setName(request.getName().trim());
        category.setCode(request.getCode().trim().toUpperCase());
        category.setDescription(request.getDescription());
        category.setWeight(request.getWeight() != null ? request.getWeight() : 15);
        category.setIcon(request.getIcon());
        category.setActive(request.getActive() != null ? request.getActive() : true);

        ComplaintCategory saved = categoryRepository.save(category);

        User currentUser = authService.getCurrentUser();
        auditService.log("CATEGORY_CREATED", "ComplaintCategory", saved.getId(), currentUser, "Created category: " + saved.getName());

        return mapToResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        ComplaintCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (request.getName() != null && !request.getName().trim().equalsIgnoreCase(category.getName())) {
            if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
                throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
            }
            category.setName(request.getName().trim());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getWeight() != null) {
            category.setWeight(request.getWeight());
        }
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        ComplaintCategory updated = categoryRepository.save(category);

        User currentUser = authService.getCurrentUser();
        auditService.log("CATEGORY_UPDATED", "ComplaintCategory", updated.getId(), currentUser, "Updated category: " + updated.getName());

        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        ComplaintCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.setActive(false);
        categoryRepository.save(category);

        User currentUser = authService.getCurrentUser();
        auditService.log("CATEGORY_DEACTIVATED", "ComplaintCategory", id, currentUser, "Deactivated category: " + category.getName());
    }

    public CategoryResponse mapToResponse(ComplaintCategory c) {
        return new CategoryResponse(
                c.getId(),
                c.getName(),
                c.getCode(),
                c.getDescription(),
                c.getWeight(),
                c.getIcon(),
                c.getActive(),
                c.getCreatedAt()
        );
    }
}
