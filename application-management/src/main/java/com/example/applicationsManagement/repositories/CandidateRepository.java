package com.example.applicationsManagement.repositories;

import com.example.applicationsManagement.entities.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
}
