package com.civicfix.controller;

import com.civicfix.dto.*;
import com.civicfix.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/register/citizen")
    public ResponseEntity<ApiResponse<AuthResponse>> registerCitizen(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Citizen registration successful", response));
    }

    @PostMapping({"/register/staff", "/register-staff"})
    public ResponseEntity<ApiResponse<AuthResponse>> registerStaff(@Valid @RequestBody StaffRegisterRequest request) {
        AuthResponse response = authService.registerStaff(request);
        return ResponseEntity.ok(ApiResponse.ok("Staff registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser() {
        UserProfileResponse response = authService.getProfile();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(@Valid @RequestBody UserUpdateRequest request) {
        UserProfileResponse response = authService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", response));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }
}
