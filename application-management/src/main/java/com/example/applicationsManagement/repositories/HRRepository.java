package com.example.applicationsManagement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.applicationsManagement.entities.HR;

public interface HRRepository extends JpaRepository<HR, Long> {
}
