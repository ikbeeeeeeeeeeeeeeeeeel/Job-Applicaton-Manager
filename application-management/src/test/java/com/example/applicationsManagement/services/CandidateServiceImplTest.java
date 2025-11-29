package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;
import com.example.applicationsManagement.entities.Candidate;
import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.repositories.ApplicationRepository;
import com.example.applicationsManagement.repositories.CandidateRepository;
import com.example.applicationsManagement.repositories.JobOfferRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CandidateServiceImpl using JUnit 5 and Mockito
 */
@ExtendWith(MockitoExtension.class)
class CandidateServiceImplTest {

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private JobOfferRepository jobOfferRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private AIScoringService aiScoringService;

    @InjectMocks
    private CandidateServiceImpl candidateService;

    private Candidate testCandidate;
    private JobOffer testJobOffer;
    private Application testApplication;

    @BeforeEach
    void setUp() {
        // Setup test candidate
        testCandidate = new Candidate();
        testCandidate.setId(1L);
        testCandidate.setUsername("testuser");
        testCandidate.setEmail("test@example.com");
        testCandidate.setPhone(1234567890L);
        testCandidate.setRole("CANDIDATE");
        testCandidate.setApplications(new ArrayList<>());

        // Setup test job offer
        testJobOffer = new JobOffer();
        testJobOffer.setId(1L);
        testJobOffer.setTitle("Software Engineer");
        testJobOffer.setDescription("Develop software");
        testJobOffer.setLocation("Remote");
        testJobOffer.setStatus("OPEN");

        // Setup test application
        testApplication = new Application();
        testApplication.setId(1L);
        testApplication.setCandidate(testCandidate);
        testApplication.setJobOffer(testJobOffer);
        testApplication.setStatus("PENDING");
    }

    @Test
    void testGetAllCandidates_Success() {
        // Given
        List<Candidate> candidates = Arrays.asList(testCandidate);
        when(candidateRepository.findAll()).thenReturn(candidates);

        // When
        List<Candidate> result = candidateService.getAllCandidates();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testCandidate.getEmail(), result.get(0).getEmail());
        verify(candidateRepository, times(1)).findAll();
    }

    @Test
    void testGetAllCandidates_EmptyList() {
        // Given
        when(candidateRepository.findAll()).thenReturn(new ArrayList<>());

        // When
        List<Candidate> result = candidateService.getAllCandidates();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(candidateRepository, times(1)).findAll();
    }

    @Test
    void testGetCandidateById_Success() {
        // Given
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(testCandidate));

        // When
        Candidate result = candidateService.getCandidateById(1L);

        // Then
        assertNotNull(result);
        assertEquals(testCandidate.getId(), result.getId());
        assertEquals(testCandidate.getEmail(), result.getEmail());
        verify(candidateRepository, times(1)).findById(1L);
    }

    @Test
    void testGetCandidateById_NotFound() {
        // Given
        when(candidateRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            candidateService.getCandidateById(999L);
        });
        
        assertTrue(exception.getMessage().contains("Candidate not found"));
        verify(candidateRepository, times(1)).findById(999L);
    }

    @Test
    void testCreateCandidate_Success() {
        // Given
        Candidate newCandidate = new Candidate();
        newCandidate.setEmail("new@example.com");
        newCandidate.setUsername("newuser");
        
        when(candidateRepository.save(any(Candidate.class))).thenReturn(newCandidate);

        // When
        Candidate result = candidateService.createCandidate(newCandidate);

        // Then
        assertNotNull(result);
        assertEquals("CANDIDATE", newCandidate.getRole()); // Role should be set automatically
        verify(candidateRepository, times(1)).save(any(Candidate.class));
    }

    @Test
    void testSearchJobs_WithKeyword() {
        // Given
        List<JobOffer> jobOffers = Arrays.asList(testJobOffer);
        when(jobOfferRepository.findByTitleContainingIgnoreCase(anyString(), any()))
                .thenReturn(jobOffers);

        // When
        List<JobOffer> result = candidateService.searchJobs("Engineer");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Software Engineer", result.get(0).getTitle());
        verify(jobOfferRepository, times(1))
                .findByTitleContainingIgnoreCase(anyString(), any());
    }

    @Test
    void testSearchJobs_WithoutKeyword() {
        // Given
        List<JobOffer> jobOffers = Arrays.asList(testJobOffer);
        when(jobOfferRepository.findAll(any(org.springframework.data.domain.Sort.class)))
                .thenReturn(jobOffers);

        // When
        List<JobOffer> result = candidateService.searchJobs(null);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(jobOfferRepository, times(1)).findAll(any(org.springframework.data.domain.Sort.class));
    }

    @Test
    void testApplyForJob_Success() {
        // Given
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(testCandidate));
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(testJobOffer));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);
        
        // Mock AI scoring service response
        java.util.Map<String, Object> scoreResult = new java.util.HashMap<>();
        scoreResult.put("score", 85.0);
        when(aiScoringService.calculateScore(any(), any(), any())).thenReturn(scoreResult);

        // When
        Application result = candidateService.applyForJob(1L, 1L, "resume content", "cover letter");

        // Then
        assertNotNull(result);
        verify(candidateRepository, times(1)).findById(1L);
        verify(jobOfferRepository, times(1)).findById(1L);
        verify(applicationRepository, times(1)).save(any(Application.class));
    }

    @Test
    void testApplyForJob_CandidateNotFound() {
        // Given
        when(candidateRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            candidateService.applyForJob(999L, 1L, "resume", "cover");
        });
        
        assertTrue(exception.getMessage().contains("Candidate not found"));
        verify(candidateRepository, times(1)).findById(999L);
        verify(applicationRepository, never()).save(any());
    }

    @Test
    void testApplyForJob_JobOfferNotFound() {
        // Given
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(testCandidate));
        when(jobOfferRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            candidateService.applyForJob(1L, 999L, "resume", "cover");
        });
        
        assertTrue(exception.getMessage().contains("Job offer not found"));
        verify(jobOfferRepository, times(1)).findById(999L);
        verify(applicationRepository, never()).save(any());
    }

    @Test
    void testApplyForJob_JobOfferClosed() {
        // Given
        testJobOffer.setStatus("CLOSED");
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(testCandidate));
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(testJobOffer));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            candidateService.applyForJob(1L, 1L, "resume", "cover");
        });
        
        assertTrue(exception.getMessage().contains("closed"));
        verify(applicationRepository, never()).save(any());
    }

    @Test
    void testApplyForJob_DuplicateApplication() {
        // Given
        testCandidate.getApplications().add(testApplication);
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(testCandidate));
        when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(testJobOffer));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            candidateService.applyForJob(1L, 1L, "resume", "cover");
        });
        
        assertTrue(exception.getMessage().contains("already applied"));
        verify(applicationRepository, never()).save(any());
    }

    @Test
    void testGetApplicationsByCandidate_Success() {
        // Given
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(testCandidate));
        testCandidate.getApplications().add(testApplication);

        // When
        List<Application> result = candidateService.getApplicationsByCandidate(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(candidateRepository, times(1)).findById(1L);
    }

    @Test
    void testDeleteApplication_Success() {
        // Given
        testApplication.setCandidate(testCandidate);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        doNothing().when(applicationRepository).delete(any(Application.class));

        // When
        candidateService.deleteApplication(1L, 1L);

        // Then
        verify(applicationRepository, times(1)).findById(1L);
        verify(applicationRepository, times(1)).delete(testApplication);
    }

    @Test
    void testDeleteApplication_NotFound() {
        // Given
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            candidateService.deleteApplication(999L, 1L);
        });
        
        assertTrue(exception.getMessage().contains("Application not found"));
        verify(applicationRepository, never()).delete(any());
    }

    @Test
    void testDeleteApplication_UnauthorizedCandidate() {
        // Given
        testApplication.setCandidate(testCandidate); // Candidate ID = 1
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            candidateService.deleteApplication(1L, 999L); // Different candidate ID
        });
        
        assertTrue(exception.getMessage().contains("Unauthorized"));
        verify(applicationRepository, never()).delete(any());
    }
}
