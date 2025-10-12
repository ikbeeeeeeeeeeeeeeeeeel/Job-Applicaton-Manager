package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Candidate;
import com.example.applicationsManagement.entities.Interview;
import com.example.applicationsManagement.entities.ProjectManager;
import com.example.applicationsManagement.repositories.InterviewRepository;
import com.example.applicationsManagement.repositories.ProjectManagerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectManagerServiceImpl implements ProjectManagerService {

    private final InterviewRepository interviewRepository;
    private final ProjectManagerRepository projectManagerRepository;

    @Override
    public ProjectManager createPm(ProjectManager pm) {
        return projectManagerRepository.save(pm);
    }

    @Override
    public List<Interview> listMeetings(Long pmId) {
        return interviewRepository.findAll(); // In real: filter by recruiter id
    }

    @Override
    public void evaluateInterview(Long interviewId, String comment) {
        Interview interview = interviewRepository.findById(interviewId).orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setStatus("Evaluated");
        interview.setResult(comment);
        // Save comment in DB if needed
        interviewRepository.save(interview);
    }
}

