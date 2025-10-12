package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;
import com.example.applicationsManagement.entities.Candidate;
import com.example.applicationsManagement.entities.Interview;
import com.example.applicationsManagement.entities.JobOffer;

import java.util.List;

public interface CandidateService {
    Candidate getCandidateById(Long id);
    Candidate createCandidate(Candidate candidate);
    List<JobOffer> searchJobs(String keyword);
    Application applyForJob(Long candidateId, Long jobOfferId);
    List<Application> getApplicationsByCandidate(Long candidateId);
    List<Interview> listInterviews(Long candidateId);
}
