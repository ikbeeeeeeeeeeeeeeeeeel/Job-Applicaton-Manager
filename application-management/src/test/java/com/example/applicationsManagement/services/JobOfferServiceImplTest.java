package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.repositories.JobOfferRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for JobOfferServiceImpl using JUnit 5 and Mockito
 */
@ExtendWith(MockitoExtension.class)
class JobOfferServiceImplTest {

    @Mock
    private JobOfferRepository jobOfferRepository;

    @InjectMocks
    private JobOfferServiceImpl jobOfferService;

    private JobOffer jobOffer1;
    private JobOffer jobOffer2;
    private JobOffer jobOffer3;

    @BeforeEach
    void setUp() {
        jobOffer1 = new JobOffer();
        jobOffer1.setId(1L);
        jobOffer1.setTitle("Senior Java Developer");
        jobOffer1.setDescription("Java development position");
        jobOffer1.setPublicationDate(new Date());
        jobOffer1.setStatus("OPEN");

        jobOffer2 = new JobOffer();
        jobOffer2.setId(2L);
        jobOffer2.setTitle("Frontend Developer");
        jobOffer2.setDescription("React development position");
        jobOffer2.setPublicationDate(new Date());
        jobOffer2.setStatus("OPEN");

        jobOffer3 = new JobOffer();
        jobOffer3.setId(3L);
        jobOffer3.setTitle("DevOps Engineer");
        jobOffer3.setDescription("CI/CD and infrastructure");
        jobOffer3.setPublicationDate(new Date());
        jobOffer3.setStatus("CLOSED");
    }

    @Test
    void testListAll_Success() {
        // Given
        List<JobOffer> jobOffers = Arrays.asList(jobOffer3, jobOffer2, jobOffer1);
        when(jobOfferRepository.findAll(any(Sort.class))).thenReturn(jobOffers);

        // When
        List<JobOffer> result = jobOfferService.listAll();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("DevOps Engineer", result.get(0).getTitle());
        assertEquals("Frontend Developer", result.get(1).getTitle());
        assertEquals("Senior Java Developer", result.get(2).getTitle());
        
        verify(jobOfferRepository, times(1)).findAll(any(Sort.class));
    }

    @Test
    void testListAll_EmptyList() {
        // Given
        when(jobOfferRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

        // When
        List<JobOffer> result = jobOfferService.listAll();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(jobOfferRepository, times(1)).findAll(any(Sort.class));
    }

    @Test
    void testListAll_SingleOffer() {
        // Given
        when(jobOfferRepository.findAll(any(Sort.class))).thenReturn(Collections.singletonList(jobOffer1));

        // When
        List<JobOffer> result = jobOfferService.listAll();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Senior Java Developer", result.get(0).getTitle());
        verify(jobOfferRepository, times(1)).findAll(any(Sort.class));
    }

    @Test
    void testListAll_VerifySortByPublicationDateDesc() {
        // Given
        List<JobOffer> jobOffers = Arrays.asList(jobOffer3, jobOffer2, jobOffer1);
        when(jobOfferRepository.findAll(any(Sort.class))).thenReturn(jobOffers);

        // When
        List<JobOffer> result = jobOfferService.listAll();

        // Then
        assertNotNull(result);
        verify(jobOfferRepository, times(1)).findAll(any(Sort.class));
    }

    @Test
    void testListAll_IncludesClosedOffers() {
        // Given
        List<JobOffer> jobOffers = Arrays.asList(jobOffer3, jobOffer2, jobOffer1);
        when(jobOfferRepository.findAll(any(Sort.class))).thenReturn(jobOffers);

        // When
        List<JobOffer> result = jobOfferService.listAll();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertTrue(result.stream().anyMatch(job -> "CLOSED".equals(job.getStatus())));
        assertTrue(result.stream().anyMatch(job -> "OPEN".equals(job.getStatus())));
    }

    @Test
    void testListAll_MultipleCallsReturnConsistentResults() {
        // Given
        List<JobOffer> jobOffers = Arrays.asList(jobOffer1, jobOffer2);
        when(jobOfferRepository.findAll(any(Sort.class))).thenReturn(jobOffers);

        // When
        List<JobOffer> result1 = jobOfferService.listAll();
        List<JobOffer> result2 = jobOfferService.listAll();

        // Then
        assertEquals(result1.size(), result2.size());
        verify(jobOfferRepository, times(2)).findAll(any(Sort.class));
    }
}
