package com.example.applicationsManagement.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * LoginRequest DTO
 * Used for authentication - accepts email OR username
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginRequest {
    String emailOrUsername;  // Can be either email or username
    String password;
    String role;  // CANDIDATE, HR, or PM
}
