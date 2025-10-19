package com.example.applicationsManagement.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * CreateUserRequest DTO
 * 
 * Used by admin to create new users (HR or PM)
 * Contains all necessary information for user creation
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateUserRequest {
    
    // Basic user information (from User class)
    String username;
    String email;
    String password;
    String role;  // "HR" or "PM"
    String firstname;
    String lastname;
    
    // Additional information
    String department;
    Long phone;
    String education;
}
