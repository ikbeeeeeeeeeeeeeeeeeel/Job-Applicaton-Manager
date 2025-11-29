package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;
import com.example.applicationsManagement.entities.Candidate;
import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.repositories.ApplicationRepository;
import com.example.applicationsManagement.repositories.CandidateRepository;
import com.example.applicationsManagement.repositories.JobOfferRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Date;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for ApplicationServiceImpl using Spring Boot Test
 */
@SpringBootTest
@Transactional
class ApplicationServiceImplTest {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private ApplicationServiceImpl applicationService;

    private Candidate testCandidate;
    private JobOffer testJobOffer;
    private Application testApplication;

    @BeforeEach
    void setUp() {
        // Create and save a candidate
        testCandidate = new Candidate();
        testCandidate.setFirstname("John");
        testCandidate.setLastname("Doe");
        testCandidate.setEmail("john.doe@test.com");
        testCandidate.setUsername("johndoe");
        testCandidate.setPassword("password123");
        testCandidate = candidateRepository.save(testCandidate);

        // Create and save a job offer
        testJobOffer = new JobOffer();
        testJobOffer.setTitle("Test Position");
        testJobOffer.setDescription("Test Description");
        testJobOffer.setStatus("OPEN");
        testJobOffer.setPublicationDate(new Date());
        testJobOffer = jobOfferRepository.save(testJobOffer);

        // Create and save an application
        testApplication = new Application();
        testApplication.setCandidate(testCandidate);
        testApplication.setJobOffer(testJobOffer);
        testApplication.setStatus("PENDING");
        testApplication.setSubmissionDate(LocalDate.now());
        testApplication = applicationRepository.save(testApplication);
    }

    @Test
    void testUpdateApplicationStatus_Success() {
        // When
        applicationService.updateApplicationStatus(testApplication.getId(), "ACCEPTED");

        // Then
        Application updated = applicationRepository.findById(testApplication.getId()).orElseThrow();
        assertEquals("ACCEPTED", updated.getStatus());
    }

    @Test
    void testUpdateApplicationStatus_ToPending() {
        // Given - First set to ACCEPTED
        applicationService.updateApplicationStatus(testApplication.getId(), "ACCEPTED");

        // When - Change back to PENDING
        applicationService.updateApplicationStatus(testApplication.getId(), "PENDING");

        // Then
        Application updated = applicationRepository.findById(testApplication.getId()).orElseThrow();
        assertEquals("PENDING", updated.getStatus());
    }

    @Test
    void testUpdateApplicationStatus_ToRejected() {
        // When
        applicationService.updateApplicationStatus(testApplication.getId(), "REJECTED");

        // Then
        Application updated = applicationRepository.findById(testApplication.getId()).orElseThrow();
        assertEquals("REJECTED", updated.getStatus());
    }

    @Test
    void testUpdateApplicationStatus_ApplicationNotFound() {
        // When & Then
        assertThrows(NoSuchElementException.class, () -> {
            applicationService.updateApplicationStatus(999L, "ACCEPTED");
        });
    }

    @Test
    void testUpdateApplicationStatus_MultipleUpdates() {
        // When - First update
        applicationService.updateApplicationStatus(testApplication.getId(), "UNDER_REVIEW");
        Application afterFirst = applicationRepository.findById(testApplication.getId()).orElseThrow();
        assertEquals("UNDER_REVIEW", afterFirst.getStatus());

        // When - Second update
        applicationService.updateApplicationStatus(testApplication.getId(), "ACCEPTED");
        Application afterSecond = applicationRepository.findById(testApplication.getId()).orElseThrow();
        assertEquals("ACCEPTED", afterSecond.getStatus());
    }
}
