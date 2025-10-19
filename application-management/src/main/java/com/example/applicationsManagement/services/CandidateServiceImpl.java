package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;
import com.example.applicationsManagement.entities.Candidate;
import com.example.applicationsManagement.entities.Interview;
import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.repositories.ApplicationRepository;
import com.example.applicationsManagement.repositories.CandidateRepository;
import com.example.applicationsManagement.repositories.InterviewRepository;
import com.example.applicationsManagement.repositories.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService{

    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;

    @Override
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    @Override
    public Candidate getCandidateById(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
    }
    @Override
    public Candidate createCandidate(Candidate candidate) {
        // Automatically set role to CANDIDATE when creating a new candidate
        candidate.setRole("CANDIDATE");
        return candidateRepository.save(candidate);
    }

    @Override
    public List<JobOffer> searchJobs(String keyword) {
        List<JobOffer> allOffers;
        
        if (keyword == null || keyword.trim().isEmpty()) {
            allOffers = jobOfferRepository.findAll(Sort.by(Sort.Direction.DESC, "publicationDate"));
        } else {
            allOffers = jobOfferRepository.findByTitleContainingIgnoreCase(keyword, Sort.by(Sort.Direction.DESC, "publicationDate"));
        }
        
        // Filter to only show Published/Open offers (exclude Closed)
        return allOffers.stream()
                .filter(offer -> {
                    String status = offer.getStatus();
                    return status == null || 
                           "Published".equalsIgnoreCase(status) || 
                           "Open".equalsIgnoreCase(status);
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Application applyForJob(Long candidateId, Long jobOfferId) {
        // Validate inputs
        if (candidateId == null || jobOfferId == null) {
            throw new RuntimeException("Invalid candidate ID or job offer ID");
        }
        
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Job offer not found with id: " + jobOfferId + ". This offer may have been deleted."));

        // Check if job offer is open (allow null status or OPEN status)
        String status = jobOffer.getStatus();
        if (status != null && "CLOSED".equalsIgnoreCase(status)) {
            throw new RuntimeException("This job offer is closed and no longer accepting applications");
        }

        // Check for duplicate application
        boolean alreadyApplied = candidate.getApplications().stream()
                .anyMatch(app -> app.getJobOffer().getId().equals(jobOfferId));
        
        if (alreadyApplied) {
            throw new RuntimeException("You have already applied to this job offer");
        }

        Application application = new Application();
        application.setCandidate(candidate);
        application.setJobOffer(jobOffer);
        application.setStatus("PENDING");
        application.setSubmissionDate(LocalDate.now());

        application.setScore(0.0); // you can update this with actual logic
        application.setAiScoreExplanation("Initial score");

        return applicationRepository.save(application);
    }

    @Override
    public List<Application> getApplicationsByCandidate(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        return candidate.getApplications();
    }


    @Override
    public List<Interview> listInterviews(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId).orElseThrow();
        return candidate.getInterviews();
    }

    @Override
    public Candidate updateProfile(Long id, java.util.Map<String, Object> updates) {
        Candidate existing = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + id));

        // Handle password change if provided
        if (updates.containsKey("currentPassword") && updates.containsKey("newPassword")) {
            String currentPassword = (String) updates.get("currentPassword");
            String newPassword = (String) updates.get("newPassword");
            
            // Verify current password
            if (!existing.getPassword().equals(currentPassword)) {
                throw new RuntimeException("Current password is incorrect");
            }
            
            // Update to new password
            existing.setPassword(newPassword);
        }

        // Update profile fields
        if (updates.containsKey("firstname")) {
            existing.setFirstname((String) updates.get("firstname"));
        }
        if (updates.containsKey("lastname")) {
            existing.setLastname((String) updates.get("lastname"));
        }
        if (updates.containsKey("email")) {
            existing.setEmail((String) updates.get("email"));
        }
        if (updates.containsKey("username")) {
            existing.setUsername((String) updates.get("username"));
        }
        if (updates.containsKey("phone") && updates.get("phone") != null) {
            Object phoneValue = updates.get("phone");
            if (phoneValue instanceof Integer) {
                existing.setPhone(((Integer) phoneValue).longValue());
            } else if (phoneValue instanceof Long) {
                existing.setPhone((Long) phoneValue);
            }
        }
        if (updates.containsKey("resume")) {
            existing.setResume((String) updates.get("resume"));
        }
        if (updates.containsKey("coverLetter")) {
            existing.setCoverLetter((String) updates.get("coverLetter"));
        }

        return candidateRepository.save(existing);
    }
}
