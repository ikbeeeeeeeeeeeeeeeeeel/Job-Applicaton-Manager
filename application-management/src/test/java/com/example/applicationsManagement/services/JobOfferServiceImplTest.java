package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.repositories.JobOfferRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for JobOfferServiceImpl using Spring Boot Test
 */
@SpringBootTest
@Transactional
class JobOfferServiceImplTest {

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private JobOfferServiceImpl jobOfferService;

    private JobOffer jobOffer1;
    private JobOffer jobOffer2;
    private JobOffer jobOffer3;

    @BeforeEach
    void setUp() {
        // Create and save job offers
        jobOffer1 = new JobOffer();
        jobOffer1.setTitle("Senior Java Developer");
        jobOffer1.setDescription("Java development position");
        jobOffer1.setPublicationDate(new Date());
        jobOffer1.setStatus("OPEN");
        jobOffer1 = jobOfferRepository.save(jobOffer1);

        jobOffer2 = new JobOffer();
        jobOffer2.setTitle("Frontend Developer");
        jobOffer2.setDescription("React development position");
        jobOffer2.setPublicationDate(new Date());
        jobOffer2.setStatus("OPEN");
        jobOffer2 = jobOfferRepository.save(jobOffer2);

        jobOffer3 = new JobOffer();
        jobOffer3.setTitle("DevOps Engineer");
        jobOffer3.setDescription("CI/CD and infrastructure");
        jobOffer3.setPublicationDate(new Date());
        jobOffer3.setStatus("CLOSED");
        jobOffer3 = jobOfferRepository.save(jobOffer3);
    }

    @Test
    void testListAll_Success() {
        // When
        List<JobOffer> result = jobOfferService.listAll();

        // Then
        assertNotNull(result);
        assertTrue(result.size() >= 3); // At least our 3 test offers
        assertTrue(result.stream().anyMatch(job -> "Senior Java Developer".equals(job.getTitle())));
        assertTrue(result.stream().anyMatch(job -> "Frontend Developer".equals(job.getTitle())));
        assertTrue(result.stream().anyMatch(job -> "DevOps Engineer".equals(job.getTitle())));
    }

    @Test
    void testListAll_IncludesAllStatuses() {
        // When
        List<JobOffer> result = jobOfferService.listAll();

        // Then
        assertNotNull(result);
        assertTrue(result.stream().anyMatch(job -> "OPEN".equals(job.getStatus())));
        assertTrue(result.stream().anyMatch(job -> "CLOSED".equals(job.getStatus())));
    }

    @Test
    void testListAll_ReturnsNonNullList() {
        // When
        List<JobOffer> result = jobOfferService.listAll();

        // Then
        assertNotNull(result);
        assertFalse(result.isEmpty());
    }
}
