package com.example.applicationsManagement.repositories;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.applicationsManagement.entities.JobOffer;

import java.util.Date;
import java.util.List;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    List<JobOffer> findByTitleContainingIgnoreCase(String keyword, Sort sort);
    
    /**
     * Find all job offers that are not CLOSED and have passed their deadline
     */
    @Query("SELECT j FROM JobOffer j WHERE j.deadline < :currentDate AND j.status != 'CLOSED'")
    List<JobOffer> findExpiredJobOffers(@Param("currentDate") Date currentDate);
}
