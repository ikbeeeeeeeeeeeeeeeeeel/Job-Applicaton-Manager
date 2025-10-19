package com.example.applicationsManagement.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Admin Entity
 * 
 * Represents system administrators who can:
 * - Create and manage HR users
 * - Create and manage Project Manager users
 * - View all candidates
 * - Manage system settings
 * - View system statistics
 * - Reset user passwords
 * 
 * Admin has full access to the system
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Admin extends User {

    // firstname and lastname inherited from User class
    
    /**
     * Admin's department or area of responsibility
     */
    private String department;
    
    /**
     * Admin's phone number
     */
    private Long phone;
    
    /**
     * Indicates if this admin has super admin privileges
     * Super admins can create other admins
     */
    private Boolean isSuperAdmin;
    
    /**
     * Automatically set role to ADMIN before persisting to database
     * This ensures every Admin has the correct role
     */
    @PrePersist
    public void prePersist() {
        if (this.getRole() == null || this.getRole().isEmpty()) {
            this.setRole("ADMIN");
        }
        
        // Default to regular admin if not specified
        if (this.isSuperAdmin == null) {
            this.isSuperAdmin = false;
        }
    }
}
