package com.example.applicationsManagement.repositories;

import com.example.applicationsManagement.entities.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Admin Repository
 * 
 * Provides database access methods for Admin entities
 * Spring Data JPA automatically implements these methods
 */
@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    
    /**
     * Find admin by email
     * Used for login authentication
     * 
     * @param email Admin's email address
     * @return Optional containing Admin if found, empty if not found
     */
    Optional<Admin> findByEmail(String email);
    
    /**
     * Find admin by username
     * Used for login authentication (allows login with username)
     * 
     * @param username Admin's username
     * @return Optional containing Admin if found, empty if not found
     */
    Optional<Admin> findByUsername(String username);
    
    /**
     * Check if an admin exists by email
     * Useful for validation during registration
     * 
     * @param email Email to check
     * @return true if admin exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Check if an admin exists by username
     * Useful for validation during registration
     * 
     * @param username Username to check
     * @return true if admin exists, false otherwise
     */
    boolean existsByUsername(String username);
}
