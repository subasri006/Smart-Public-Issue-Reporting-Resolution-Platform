package com.civicfix.controller;

import com.civicfix.dto.ApiResponse;
import com.civicfix.dto.UserResponse;
import com.civicfix.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffController {

    private final UserService userService;

    public StaffController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getStaffList() {
        List<UserResponse> list = userService.getStaffMembers();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
