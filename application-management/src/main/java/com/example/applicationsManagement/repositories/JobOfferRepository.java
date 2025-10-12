package com.example.applicationsManagement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.applicationsManagement.entities.JobOffer;

import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    List<JobOffer> findByTitleContainingIgnoreCase(String keyword);
}
