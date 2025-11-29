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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for CandidateServiceImpl using Spring Boot Test
 * These tests execute real code and provide actual code coverage
 */
@SpringBootTest
@Transactional
class CandidateServiceIntegrationTest {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CandidateServiceImpl candidateService;

    private Candidate testCandidate;
    private JobOffer testJobOffer;
    private Application testApplication;

    @BeforeEach
    void setUp() {
        // Create and save test candidate
        testCandidate = new Candidate();
        testCandidate.setFirstname("John");
        testCandidate.setLastname("Doe");
        testCandidate.setUsername("johndoe");
        testCandidate.setEmail("john@example.com");
        testCandidate.setPassword("password123");
        testCandidate.setPhone(1234567890L);
        testCandidate = candidateRepository.save(testCandidate);

        // Create and save test job offer
        testJobOffer = new JobOffer();
        testJobOffer.setTitle("Software Engineer");
        testJobOffer.setDescription("Develop amazing software");
        testJobOffer.setLocation("Remote");
        testJobOffer.setStatus("OPEN");
        testJobOffer.setPublicationDate(new Date());
        testJobOffer = jobOfferRepository.save(testJobOffer);

        // Create and save test application
        testApplication = new Application();
        testApplication.setCandidate(testCandidate);
        testApplication.setJobOffer(testJobOffer);
        testApplication.setStatus("PENDING");
        testApplication.setSubmissionDate(LocalDate.now());
        testApplication = applicationRepository.save(testApplication);
    }

    @Test
    void testGetAllCandidates_Success() {
        // When
        List<Candidate> result = candidateService.getAllCandidates();

        // Then
        assertNotNull(result);
        assertTrue(result.size() >= 1);
        assertTrue(result.stream().anyMatch(c -> "johndoe".equals(c.getUsername())));
    }

    @Test
    void testGetCandidateById_Success() {
        // When
        Candidate result = candidateService.getCandidateById(testCandidate.getId());

        // Then
        assertNotNull(result);
        assertEquals("johndoe", result.getUsername());
        assertEquals("john@example.com", result.getEmail());
    }

    @Test
    void testGetCandidateById_NotFound() {
        // When & Then
        assertThrows(RuntimeException.class, () -> {
            candidateService.getCandidateById(99999L);
        });
    }

    @Test
    void testCreateCandidate_Success() {
        // Given
        Candidate newCandidate = new Candidate();
        newCandidate.setFirstname("Jane");
        newCandidate.setLastname("Smith");
        newCandidate.setUsername("janesmith");
        newCandidate.setEmail("jane@example.com");
        newCandidate.setPassword("password456");
        newCandidate.setPhone(9876543210L);

        // When
        Candidate result = candidateService.createCandidate(newCandidate);

        // Then
        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("janesmith", result.getUsername());
        assertEquals("CANDIDATE", result.getRole());
    }

    @Test
    void testSearchJobs_WithKeyword() {
        // When
        List<JobOffer> result = candidateService.searchJobs("Software");

        // Then
        assertNotNull(result);
        assertTrue(result.stream().anyMatch(job -> job.getTitle().contains("Software")));
    }

    @Test
    void testSearchJobs_WithoutKeyword() {
        // When
        List<JobOffer> result = candidateService.searchJobs(null);

        // Then
        assertNotNull(result);
        assertTrue(result.size() >= 1);
    }

    @Test
    void testApplyForJob_Success() {
        // Given - Create a new job offer to avoid duplicate application
        JobOffer newJob = new JobOffer();
        newJob.setTitle("Backend Developer");
        newJob.setDescription("Java Backend Development");
        newJob.setStatus("OPEN");
        newJob.setPublicationDate(new Date());
        newJob = jobOfferRepository.save(newJob);

        // When
        Application result = candidateService.applyForJob(
            testCandidate.getId(),
            newJob.getId(),
            "My resume content",
            "My cover letter"
        );

        // Then
        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals(testCandidate.getId(), result.getCandidate().getId());
        assertEquals(newJob.getId(), result.getJobOffer().getId());
    }

    @Test
    void testApplyForJob_CandidateNotFound() {
        // When & Then
        assertThrows(RuntimeException.class, () -> {
            candidateService.applyForJob(99999L, testJobOffer.getId(), "resume", "cover");
        });
    }

    @Test
    void testApplyForJob_JobOfferNotFound() {
        // When & Then
        assertThrows(RuntimeException.class, () -> {
            candidateService.applyForJob(testCandidate.getId(), 99999L, "resume", "cover");
        });
    }

    @Test
    void testApplyForJob_JobOfferClosed() {
        // Given
        JobOffer closedJob = new JobOffer();
        closedJob.setTitle("Closed Position");
        closedJob.setDescription("This position is closed");
        closedJob.setStatus("CLOSED");
        closedJob.setPublicationDate(new Date());
        JobOffer savedClosedJob = jobOfferRepository.save(closedJob);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            candidateService.applyForJob(testCandidate.getId(), savedClosedJob.getId(), "resume", "cover");
        });
    }

    @Test
    void testGetApplicationsByCandidate_Success() {
        // When
        List<Application> result = candidateService.getApplicationsByCandidate(testCandidate.getId());

        // Then
        assertNotNull(result);
        assertTrue(result.size() >= 1);
        assertTrue(result.stream().anyMatch(app -> app.getCandidate().getId().equals(testCandidate.getId())));
    }

    @Test
    void testDeleteApplication_Success() {
        // When
        candidateService.deleteApplication(testApplication.getId(), testCandidate.getId());

        // Then
        assertFalse(applicationRepository.findById(testApplication.getId()).isPresent());
    }

    @Test
    void testDeleteApplication_NotFound() {
        // When & Then
        assertThrows(RuntimeException.class, () -> {
            candidateService.deleteApplication(99999L, testCandidate.getId());
        });
    }

    @Test
    void testDeleteApplication_UnauthorizedCandidate() {
        // Given - Create another candidate
        Candidate otherCandidate = new Candidate();
        otherCandidate.setFirstname("Other");
        otherCandidate.setLastname("User");
        otherCandidate.setUsername("otheruser");
        otherCandidate.setEmail("other@example.com");
        otherCandidate.setPassword("password");
        Candidate savedOtherCandidate = candidateRepository.save(otherCandidate);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            candidateService.deleteApplication(testApplication.getId(), savedOtherCandidate.getId());
        });
    }

    @Test
    void testUpdateProfile_Success() {
        // Given
        java.util.Map<String, Object> updates = new java.util.HashMap<>();
        updates.put("firstname", "John Updated");
        updates.put("lastname", "Doe Updated");
        updates.put("phone", 5555555555L);

        // When
        Candidate result = candidateService.updateProfile(testCandidate.getId(), updates);

        // Then
        assertNotNull(result);
        assertEquals("John Updated", result.getFirstname());
        assertEquals("Doe Updated", result.getLastname());
        assertEquals(5555555555L, result.getPhone());
    }
}
