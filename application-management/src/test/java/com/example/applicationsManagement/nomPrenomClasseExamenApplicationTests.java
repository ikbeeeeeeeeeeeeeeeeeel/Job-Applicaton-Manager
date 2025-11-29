package com.example.applicationsManagement;

import com.example.applicationsManagement.entities.Candidate;
import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.entities.Application;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class nomPrenomClasseExamenApplicationTests {

    @Test
    void contextLoads() {
        // Test that Spring context loads successfully
        assertNotNull("Context should load", this);
    }

    @Test
    void testCandidateEntity() {
        Candidate candidate = new Candidate();
        candidate.setId(1L);
        candidate.setUsername("testuser");
        candidate.setEmail("test@example.com");
        candidate.setPhone(1234567890L);
        candidate.setRole("CANDIDATE");

        assertEquals(1L, candidate.getId());
        assertEquals("testuser", candidate.getUsername());
        assertEquals("test@example.com", candidate.getEmail());
        assertEquals(1234567890L, candidate.getPhone());
        assertEquals("CANDIDATE", candidate.getRole());
    }

    @Test
    void testJobOfferEntity() {
        JobOffer jobOffer = new JobOffer();
        jobOffer.setId(1L);
        jobOffer.setTitle("Software Engineer");
        jobOffer.setDescription("Develop software");
        jobOffer.setLocation("Remote");
        jobOffer.setStatus("OPEN");

        assertEquals(1L, jobOffer.getId());
        assertEquals("Software Engineer", jobOffer.getTitle());
        assertEquals("Develop software", jobOffer.getDescription());
        assertEquals("Remote", jobOffer.getLocation());
        assertEquals("OPEN", jobOffer.getStatus());
    }

    @Test
    void testApplicationEntity() {
        Application application = new Application();
        application.setId(1L);
        application.setStatus("PENDING");

        assertEquals(1L, application.getId());
        assertEquals("PENDING", application.getStatus());
    }

    @Test
    void testCandidatePrePersist() {
        Candidate candidate = new Candidate();
        candidate.prePersist();
        
        assertEquals("CANDIDATE", candidate.getRole());
    }

}
