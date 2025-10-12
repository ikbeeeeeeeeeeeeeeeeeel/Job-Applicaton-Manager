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
    public Candidate getCandidateById(Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
    }
    @Override
    public Candidate createCandidate(Candidate candidate) {
        return candidateRepository.save(candidate);
    }

    @Override
    public List<JobOffer> searchJobs(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return jobOfferRepository.findAll(); // Return all if no keyword
        }
        return jobOfferRepository.findByTitleContainingIgnoreCase(keyword);
    }

    @Override
    public Application applyForJob(Long candidateId, Long jobOfferId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Job offer not found with id: " + jobOfferId));

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
}
