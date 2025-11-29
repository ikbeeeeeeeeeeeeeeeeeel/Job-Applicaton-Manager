package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;
import com.example.applicationsManagement.repositories.ApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ApplicationServiceImpl using JUnit 5 and Mockito
 */
@ExtendWith(MockitoExtension.class)
class ApplicationServiceImplTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    private Application testApplication;

    @BeforeEach
    void setUp() {
        testApplication = new Application();
        testApplication.setId(1L);
        testApplication.setStatus("PENDING");
    }

    @Test
    void testUpdateApplicationStatus_Success() {
        // Given
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When
        applicationService.updateApplicationStatus(1L, "ACCEPTED");

        // Then
        verify(applicationRepository, times(1)).findById(1L);
        verify(applicationRepository, times(1)).save(testApplication);
        assertEquals("ACCEPTED", testApplication.getStatus());
    }

    @Test
    void testUpdateApplicationStatus_ToPending() {
        // Given
        testApplication.setStatus("ACCEPTED");
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When
        applicationService.updateApplicationStatus(1L, "PENDING");

        // Then
        assertEquals("PENDING", testApplication.getStatus());
        verify(applicationRepository, times(1)).save(testApplication);
    }

    @Test
    void testUpdateApplicationStatus_ToRejected() {
        // Given
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When
        applicationService.updateApplicationStatus(1L, "REJECTED");

        // Then
        assertEquals("REJECTED", testApplication.getStatus());
        verify(applicationRepository, times(1)).save(testApplication);
    }

    @Test
    void testUpdateApplicationStatus_ApplicationNotFound() {
        // Given
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class, () -> {
            applicationService.updateApplicationStatus(999L, "ACCEPTED");
        });
        
        verify(applicationRepository, times(1)).findById(999L);
        verify(applicationRepository, never()).save(any());
    }

    @Test
    void testUpdateApplicationStatus_MultipleUpdates() {
        // Given
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // When - First update
        applicationService.updateApplicationStatus(1L, "UNDER_REVIEW");
        assertEquals("UNDER_REVIEW", testApplication.getStatus());

        // When - Second update
        applicationService.updateApplicationStatus(1L, "ACCEPTED");
        assertEquals("ACCEPTED", testApplication.getStatus());

        // Then
        verify(applicationRepository, times(2)).findById(1L);
        verify(applicationRepository, times(2)).save(testApplication);
    }
}
