package com.example.applicationsManagement.services;

import com.example.applicationsManagement.dto.CreateUserRequest;
import com.example.applicationsManagement.dto.UserDTO;
import com.example.applicationsManagement.entities.Admin;

import java.util.List;
import java.util.Map;

/**
 * Admin Service Interface
 * 
 * Defines business logic operations for admin functionality
 */
public interface AdminService {
    
    /**
     * Get admin by ID
     */
    Admin getAdminById(Long id);
    
    /**
     * Create a new HR user
     */
    UserDTO createHRUser(CreateUserRequest request);
    
    /**
     * Create a new Project Manager user
     */
    UserDTO createPMUser(CreateUserRequest request);
    
    /**
     * Get all HR users
     */
    List<UserDTO> getAllHRUsers();
    
    /**
     * Get all Project Manager users
     */
    List<UserDTO> getAllPMUsers();
    
    /**
     * Get all Candidate users
     */
    List<UserDTO> getAllCandidates();
    
    /**
     * Delete user by ID and role
     */
    void deleteUser(Long userId, String role);
    
    /**
     * Update user information
     */
    UserDTO updateUser(Long userId, String role, CreateUserRequest request);
    
    /**
     * Reset user password
     */
    void resetPassword(Long userId, String role, String newPassword);
    
    /**
     * Get system statistics (dashboard)
     */
    Map<String, Object> getSystemStatistics();
}
