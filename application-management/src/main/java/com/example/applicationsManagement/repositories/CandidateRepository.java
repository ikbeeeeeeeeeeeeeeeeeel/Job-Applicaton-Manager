package com.example.applicationsManagement.repositories;

import com.example.applicationsManagement.entities.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    // For login with email
    Optional<Candidate> findByEmail(String email);
    
    // For login with username
    Optional<Candidate> findByUsername(String username);
}
