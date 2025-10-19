package com.example.applicationsManagement.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * LoginResponse DTO
 * Returns user data after successful authentication
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginResponse {
    Long id;
    String email;
    String username;
    String role;
    String firstname;
    String lastname;
    String token;  // For future JWT implementation
}
