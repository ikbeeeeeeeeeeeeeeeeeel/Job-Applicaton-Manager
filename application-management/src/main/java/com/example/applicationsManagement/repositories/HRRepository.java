package com.example.applicationsManagement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.applicationsManagement.entities.HR;

import java.util.Optional;

public interface HRRepository extends JpaRepository<HR, Long> {
    // For login with email
    Optional<HR> findByEmail(String email);
    
    // For login with username
    Optional<HR> findByUsername(String username);
    
    // For validation during user creation
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
