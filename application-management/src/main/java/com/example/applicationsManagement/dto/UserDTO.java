package com.example.applicationsManagement.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * UserDTO
 * 
 * Generic user data transfer object
 * Used to return user information to frontend without sensitive data
 * Works for all user types (Candidate, HR, PM, Admin)
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDTO {
    Long id;
    String username;
    String email;
    String role;
    String firstname;
    String lastname;
    String department;  // For HR, PM, Admin
    Long phone;
    String education;  // For HR, PM
    
    // Constructor for basic user info
    public UserDTO(Long id, String username, String email, String role, String firstname, String lastname) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.firstname = firstname;
        this.lastname = lastname;
    }
}
