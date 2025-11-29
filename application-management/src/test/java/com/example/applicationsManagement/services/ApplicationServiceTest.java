package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;
import com.example.applicationsManagement.entities.Candidate;
import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.repositories.ApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    private Application testApplication;
    private Candidate testCandidate;
    private JobOffer testJobOffer;

    @BeforeEach
    void setUp() {
        testCandidate = new Candidate();
        testCandidate.setId(1L);
        testCandidate.setEmail("test@example.com");

        testJobOffer = new JobOffer();
        testJobOffer.setId(1L);
        testJobOffer.setTitle("Software Engineer");

        testApplication = new Application();
        testApplication.setId(1L);
        testApplication.setCandidate(testCandidate);
        testApplication.setJobOffer(testJobOffer);
        testApplication.setApplicationDate(LocalDate.now());
        testApplication.setStatus("PENDING");
    }

    @Test
    void testGetAllApplications() {
        // Given
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findAll()).thenReturn(applications);

        // When
        List<Application> result = applicationService.getAllApplications();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testApplication.getId(), result.get(0).getId());
        verify(applicationRepository, times(1)).findAll();
    }

    @Test
    void testGetApplicationById() {
        // Given
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));

        // When
        Optional<Application> result = applicationService.getApplicationById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testApplication.getId(), result.get().getId());
        verify(applicationRepository, times(1)).findById(1L);
    }

    @Test
    void testGetApplicationById_NotFound() {
        // Given
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Application> result = applicationService.getApplicationById(999L);

        // Then
        assertFalse(result.isPresent());
        verify(applicationRepository, times(1)).findById(999L);
    }

    @Test
    void testSaveApplication() {
        // Given
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When
        Application result = applicationService.saveApplication(testApplication);

        // Then
        assertNotNull(result);
        assertEquals(testApplication.getId(), result.getId());
        verify(applicationRepository, times(1)).save(testApplication);
    }

    @Test
    void testDeleteApplication() {
        // Given
        doNothing().when(applicationRepository).deleteById(1L);

        // When
        applicationService.deleteApplication(1L);

        // Then
        verify(applicationRepository, times(1)).deleteById(1L);
    }

    @Test
    void testGetApplicationsByCandidate() {
        // Given
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByCandidate(testCandidate)).thenReturn(applications);

        // When
        List<Application> result = applicationService.getApplicationsByCandidate(testCandidate);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testApplication.getId(), result.get(0).getId());
        verify(applicationRepository, times(1)).findByCandidate(testCandidate);
    }

    @Test
    void testGetApplicationsByJobOffer() {
        // Given
        List<Application> applications = Arrays.asList(testApplication);
        when(applicationRepository.findByJobOffer(testJobOffer)).thenReturn(applications);

        // When
        List<Application> result = applicationService.getApplicationsByJobOffer(testJobOffer);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testApplication.getId(), result.get(0).getId());
        verify(applicationRepository, times(1)).findByJobOffer(testJobOffer);
    }

    @Test
    void testUpdateApplicationStatus() {
        // Given
        testApplication.setStatus("PENDING");
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When
        Application result = applicationService.updateApplicationStatus(1L, "ACCEPTED");

        // Then
        assertNotNull(result);
        assertEquals("ACCEPTED", result.getStatus());
        verify(applicationRepository, times(1)).findById(1L);
        verify(applicationRepository, times(1)).save(any(Application.class));
    }
}
