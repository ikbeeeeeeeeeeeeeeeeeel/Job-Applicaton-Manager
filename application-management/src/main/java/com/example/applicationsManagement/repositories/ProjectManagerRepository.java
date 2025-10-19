package com.example.applicationsManagement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.applicationsManagement.entities.ProjectManager;

import java.util.Optional;

public interface ProjectManagerRepository extends JpaRepository<ProjectManager, Long> {
    // For login with email
    Optional<ProjectManager> findByEmail(String email);
    
    // For login with username
    Optional<ProjectManager> findByUsername(String username);
    
    // For validation during user creation
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
