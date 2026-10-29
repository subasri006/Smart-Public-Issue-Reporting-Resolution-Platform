package com.civicfix.service;

import com.civicfix.dto.CreateUserRequest;
import com.civicfix.dto.PagedResponse;
import com.civicfix.dto.UserResponse;
import com.civicfix.dto.UserUpdateRequest;
import com.civicfix.entity.User;
import com.civicfix.enums.Role;
import com.civicfix.exception.BadRequestException;
import com.civicfix.exception.ConflictException;
import com.civicfix.exception.ResourceNotFoundException;
import com.civicfix.repository.ComplaintRepository;
import com.civicfix.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final AuthService authService;

    public UserService(UserRepository userRepository,
                       ComplaintRepository complaintRepository,
                       PasswordEncoder passwordEncoder,
                       AuditService auditService,
                       AuthService authService) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsers(Role role, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.searchUsers(role, (search != null && !search.trim().isEmpty()) ? search.trim() : null, pageable);

        List<UserResponse> list = userPage.getContent().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                list,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getStaffMembers() {
        return userRepository.findByRoleAndActiveTrue(Role.ROLE_STAFF).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (request.getRole() == Role.ROLE_ADMIN && userRepository.countByRole(Role.ROLE_ADMIN) >= 1) {
            throw new BadRequestException("An administrator account already exists. CivicFix permits exactly one administrator.");
        }

        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new ConflictException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ConflictException("Email is already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setRole(request.getRole());
        user.setActive(true);

        User saved = userRepository.save(user);

        User currentUser = authService.getCurrentUser();
        auditService.log("USER_CREATED_BY_ADMIN", "User", saved.getId(), currentUser,
                "Created user " + saved.getUsername() + " with role " + saved.getRole());

        return mapToUserResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Single administrator protection rules
        if (user.getRole() == Role.ROLE_ADMIN) {
            if (request.getRole() != null && request.getRole() != Role.ROLE_ADMIN) {
                throw new BadRequestException("Cannot change the role of the primary administrator.");
            }
            if (request.getActive() != null && !request.getActive()) {
                throw new BadRequestException("Cannot deactivate the primary administrator account.");
            }
        } else if (request.getRole() == Role.ROLE_ADMIN) {
            if (userRepository.countByRole(Role.ROLE_ADMIN) >= 1) {
                throw new BadRequestException("Cannot promote user to administrator. CivicFix permits exactly one administrator.");
            }
        }

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User updated = userRepository.save(user);

        User currentUser = authService.getCurrentUser();
        auditService.log("USER_UPDATED_BY_ADMIN", "User", updated.getId(), currentUser,
                "Updated user " + updated.getUsername() + " (role: " + updated.getRole() + ", active: " + updated.getActive() + ")");

        return mapToUserResponse(updated);
    }

    private UserResponse mapToUserResponse(User u) {
        UserResponse response = new UserResponse(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getFullName(),
                u.getDepartment(),
                u.getPhone(),
                u.getRole(),
                u.getActive(),
                u.getCreatedAt()
        );
        if (u.getRole() == Role.ROLE_STAFF) {
            response.setAssignedCount(complaintRepository.countByAssignedStaff(u));
            response.setResolvedCount(complaintRepository.countByAssignedStaffAndStatus(u, com.civicfix.enums.ComplaintStatus.RESOLVED));
        }
        return response;
    }
}
