package com.example.applicationsManagement.controllers;

import com.example.applicationsManagement.dto.CreateUserRequest;
import com.example.applicationsManagement.dto.UserDTO;
import com.example.applicationsManagement.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Controller
 * 
 * Handles all admin-related operations:
 * - Creating HR and PM users
 * - Managing users (view, update, delete)
 * - Resetting passwords
 * - Viewing system statistics
 * 
 * All endpoints require ADMIN role authentication
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;

    /**
     * Create new HR user
     * POST /api/admin/create-hr
     */
    @PostMapping("/create-hr")
    public ResponseEntity<?> createHRUser(@RequestBody CreateUserRequest request) {
        try {
            UserDTO createdUser = adminService.createHRUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Create new Project Manager user
     * POST /api/admin/create-pm
     */
    @PostMapping("/create-pm")
    public ResponseEntity<?> createPMUser(@RequestBody CreateUserRequest request) {
        try {
            UserDTO createdUser = adminService.createPMUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get all HR users
     * GET /api/admin/hr-users
     */
    @GetMapping("/hr-users")
    public ResponseEntity<List<UserDTO>> getAllHRUsers() {
        List<UserDTO> hrUsers = adminService.getAllHRUsers();
        return ResponseEntity.ok(hrUsers);
    }

    /**
     * Get all Project Manager users
     * GET /api/admin/pm-users
     */
    @GetMapping("/pm-users")
    public ResponseEntity<List<UserDTO>> getAllPMUsers() {
        List<UserDTO> pmUsers = adminService.getAllPMUsers();
        return ResponseEntity.ok(pmUsers);
    }

    /**
     * Get all Candidate users
     * GET /api/admin/candidates
     */
    @GetMapping("/candidates")
    public ResponseEntity<List<UserDTO>> getAllCandidates() {
        List<UserDTO> candidates = adminService.getAllCandidates();
        return ResponseEntity.ok(candidates);
    }

    /**
     * Delete user by ID and role
     * DELETE /api/admin/users/{userId}?role={role}
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long userId,
            @RequestParam String role) {
        try {
            adminService.deleteUser(userId, role);
            return ResponseEntity.ok(createSuccessResponse("User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Update user information
     * PUT /api/admin/users/{userId}?role={role}
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestParam String role,
            @RequestBody CreateUserRequest request) {
        try {
            UserDTO updatedUser = adminService.updateUser(userId, role, request);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Reset user password
     * POST /api/admin/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            Long userId = Long.parseLong(request.get("userId"));
            String role = request.get("role");
            String newPassword = request.get("newPassword");

            adminService.resetPassword(userId, role, newPassword);
            return ResponseEntity.ok(createSuccessResponse("Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get system statistics for dashboard
     * GET /api/admin/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSystemStatistics() {
        Map<String, Object> stats = adminService.getSystemStatistics();
        return ResponseEntity.ok(stats);
    }

    // Helper methods

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        return error;
    }

    private Map<String, String> createSuccessResponse(String message) {
        Map<String, String> success = new HashMap<>();
        success.put("message", message);
        return success;
    }
}
