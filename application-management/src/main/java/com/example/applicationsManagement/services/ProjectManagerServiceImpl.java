package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;
import com.example.applicationsManagement.entities.Interview;
import com.example.applicationsManagement.entities.ProjectManager;
import com.example.applicationsManagement.repositories.ApplicationRepository;
import com.example.applicationsManagement.repositories.InterviewRepository;
import com.example.applicationsManagement.repositories.ProjectManagerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectManagerServiceImpl implements ProjectManagerService {

    private final InterviewRepository interviewRepository;
    private final ProjectManagerRepository projectManagerRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    public List<ProjectManager> getAllProjectManagers() {
        return projectManagerRepository.findAll();
    }

    @Override
    public ProjectManager createPm(ProjectManager pm) {
        return projectManagerRepository.save(pm);
    }

    @Override
    public List<Interview> listMeetings(Long pmId) {
        return interviewRepository.findAll(Sort.by(Sort.Direction.DESC, "interviewDate")); // In real: filter by recruiter id
    }

    @Override
    public void evaluateInterview(Long interviewId, String comment) {
        Interview interview = interviewRepository.findById(interviewId).orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setStatus("Evaluated");
        interview.setResult(comment);
        // Save comment in DB if needed
        interviewRepository.save(interview);
    }

    @Override
    public void finalizeApplication(Long interviewId, String decision, String comment) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        
        // Update interview status and result
        interview.setStatus("Completed");
        interview.setResult(decision); // ACCEPTED or REJECTED
        interviewRepository.save(interview);
        
        // Update application status based on PM decision
        if (interview.getApplication() != null) {
            Application application = interview.getApplication();
            application.setStatus(decision); // ACCEPTED or REJECTED
            application.setAiScoreExplanation(
                application.getAiScoreExplanation() + "\n\n📝 PM Feedback: " + comment
            );
            applicationRepository.save(application); // 🔥 IMPORTANT: Save the application!
        }
    }

    @Override
    public ProjectManager updateProfile(Long id, java.util.Map<String, Object> updates) {
        ProjectManager existing = projectManagerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project Manager not found with id: " + id));

        // Handle password change if provided
        if (updates.containsKey("currentPassword") && updates.containsKey("newPassword")) {
            String currentPassword = (String) updates.get("currentPassword");
            String newPassword = (String) updates.get("newPassword");
            
            if (!existing.getPassword().equals(currentPassword)) {
                throw new RuntimeException("Current password is incorrect");
            }
            
            existing.setPassword(newPassword);
        }

        // Update profile fields (EMAIL CANNOT BE CHANGED - company email)
        if (updates.containsKey("firstname")) {
            existing.setFirstname((String) updates.get("firstname"));
        }
        if (updates.containsKey("lastname")) {
            existing.setLastname((String) updates.get("lastname"));
        }
        if (updates.containsKey("username")) {
            existing.setUsername((String) updates.get("username"));
        }
        // Note: Email is NOT updatable for PM - it's a company email

        return projectManagerRepository.save(existing);
    }
}

