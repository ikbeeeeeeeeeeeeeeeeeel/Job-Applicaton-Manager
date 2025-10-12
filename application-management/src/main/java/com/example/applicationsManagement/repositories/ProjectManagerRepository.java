package com.example.applicationsManagement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.applicationsManagement.entities.ProjectManager;

public interface ProjectManagerRepository extends JpaRepository<ProjectManager, Long> {
}
