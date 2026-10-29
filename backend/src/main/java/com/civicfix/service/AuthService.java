package com.civicfix.service;

import com.civicfix.dto.*;
import com.civicfix.entity.User;
import com.civicfix.enums.Role;
import com.civicfix.exception.BadRequestException;
import com.civicfix.exception.ConflictException;
import com.civicfix.exception.ResourceNotFoundException;
import com.civicfix.repository.UserRepository;
import com.civicfix.security.JwtTokenProvider;
import com.civicfix.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
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
        user.setRole(Role.ROLE_CITIZEN);
        user.setActive(true);

        User saved = userRepository.save(user);

        auditService.log("USER_REGISTERED", "User", saved.getId(), saved, "Citizen self-registered: " + saved.getUsername());

        // Authenticate immediately
        UserPrincipal principal = UserPrincipal.create(saved);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(token, saved.getId(), saved.getUsername(), saved.getEmail(), saved.getFullName(), saved.getDepartment(), saved.getRole());
    }

    @Transactional
    public AuthResponse registerStaff(StaffRegisterRequest request) {
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
        user.setDepartment(request.getDepartment() != null && !request.getDepartment().trim().isEmpty() ? request.getDepartment().trim() : null);
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setRole(Role.ROLE_STAFF); // Strictly assigned as ROLE_STAFF
        user.setActive(true);

        User saved = userRepository.save(user);

        auditService.log("STAFF_REGISTERED", "User", saved.getId(), saved, "Staff self-registered: " + saved.getUsername());

        // Authenticate immediately
        UserPrincipal principal = UserPrincipal.create(saved);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(token, saved.getId(), saved.getUsername(), saved.getEmail(), saved.getFullName(), saved.getDepartment(), saved.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        auditService.log("USER_LOGIN", "User", user.getId(), user, "User logged in: " + user.getUsername());

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getDepartment(), user.getRole());
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BadRequestException("No authenticated user found in session");
        }
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile() {
        User user = getCurrentUser();
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getDepartment(),
                user.getPhone(),
                user.getRole(),
                user.getActive(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public UserProfileResponse updateProfile(UserUpdateRequest request) {
        User user = getCurrentUser();
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        User updated = userRepository.save(user);
        auditService.log("PROFILE_UPDATED", "User", updated.getId(), updated, "Profile updated by user");

        return new UserProfileResponse(
                updated.getId(),
                updated.getUsername(),
                updated.getEmail(),
                updated.getFullName(),
                updated.getDepartment(),
                updated.getPhone(),
                updated.getRole(),
                updated.getActive(),
                updated.getCreatedAt()
        );
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditService.log("PASSWORD_CHANGED", "User", user.getId(), user, "Password changed by user");
    }
}
