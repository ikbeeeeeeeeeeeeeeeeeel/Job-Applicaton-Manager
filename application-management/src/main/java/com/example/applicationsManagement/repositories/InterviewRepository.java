package com.example.applicationsManagement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.applicationsManagement.entities.Interview;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
}
