package com.example.applicationsManagement.repositories;

import com.example.applicationsManagement.entities.Application;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
}
