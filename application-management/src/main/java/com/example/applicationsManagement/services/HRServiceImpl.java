package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.*;
import com.example.applicationsManagement.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HRServiceImpl implements HRService{

    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final NotificationRepository notificationRepository;
    private final CandidateRepository candidateRepository;
    private final ProjectManagerRepository projectManagerRepository;
    private final HRRepository hrRepository;

    @Override
    public List<JobOffer> listJobOffers() {
        return jobOfferRepository.findAll(Sort.by(Sort.Direction.DESC, "publicationDate"));
    }
    @Override
    public List<Interview> listAllInterviews() {
        return interviewRepository.findAll(Sort.by(Sort.Direction.DESC, "interviewDate"));
    }

    @Override
    public JobOffer publishJobOffer(JobOffer jobOffer) {
        System.out.println("Received JobOffer: " + jobOffer);
        jobOffer.setPublicationDate(new Date());
        jobOffer.setStatus("Published");
        return jobOfferRepository.save(jobOffer);
    }

    @Override
    public JobOffer closeJobOffer(Long jobOfferId) {
        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Job offer not found with id: " + jobOfferId));
        jobOffer.setStatus("CLOSED");
        return jobOfferRepository.save(jobOffer);
    }

    @Override
    public JobOffer openJobOffer(Long jobOfferId) {
        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Job offer not found with id: " + jobOfferId));
        jobOffer.setStatus("OPEN");
        return jobOfferRepository.save(jobOffer);
    }

    @Override
    public void deleteJobOffer(Long id) {
        if (!jobOfferRepository.existsById(id)) {
            throw new RuntimeException("Job offer not found with id: " + id);
        }
        jobOfferRepository.deleteById(id);
    }
    @Override
    public JobOffer modifyJobOffer(JobOffer jobOffer) {
        JobOffer existing = jobOfferRepository.findById(jobOffer.getId())
                .orElseThrow(() -> new RuntimeException("Job offer not found with id: " + jobOffer.getId()));

        // Preserve immutable fields
        jobOffer.setPublicationDate(existing.getPublicationDate());

        // Preserve status if frontend doesn’t send it
        if (jobOffer.getStatus() == null || jobOffer.getStatus().isBlank()) {
            jobOffer.setStatus(existing.getStatus());
        }

        return jobOfferRepository.save(jobOffer);
    }

    public Interview planMeeting(Long candidateId, Long projectManagerId, Date date) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        ProjectManager pm = projectManagerRepository.findById(projectManagerId)
                .orElseThrow(() -> new RuntimeException("PM not found"));

        Interview interview = new Interview();
        interview.setCandidate(candidate);
        interview.setRecruiter(pm);
        interview.setInterviewDate(date);

        return interviewRepository.save(interview);
    }
    @Override
    public Interview createInterview(Interview interview, Long candidateId, Long projectManagerId, Long applicationId) {
        System.out.println("Received Interview: " + interview);
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        ProjectManager pm = projectManagerRepository.findById(projectManagerId)
                .orElseThrow(() -> new RuntimeException("PM not found"));
        
        // Find and update application status to INTERVIEW_SCHEDULED
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus("INTERVIEW_SCHEDULED");
        applicationRepository.save(application);
        
        interview.setStatus("Planned");
        interview.setCandidate(candidate);
        interview.setRecruiter(pm);
        interview.setApplication(application);
        return interviewRepository.save(interview);
    }
    @Override
    public Interview updateInterview(Long id, Interview updatedInterview, Long candidateId, Long projectManagerId) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found with ID: " + id));

        // ✅ Update candidate if provided
        if (candidateId != null) {
            Candidate candidate = candidateRepository.findById(candidateId)
                    .orElseThrow(() -> new RuntimeException("Candidate not found with ID: " + candidateId));
            interview.setCandidate(candidate);
        }

        // ✅ Update project manager if provided
        if (projectManagerId != null) {
            ProjectManager pm = projectManagerRepository.findById(projectManagerId)
                    .orElseThrow(() -> new RuntimeException("Project Manager not found with ID: " + projectManagerId));
            interview.setRecruiter(pm);
        }

        // ✅ Update fields if not null
        if (updatedInterview.getInterviewDate() != null)
            interview.setInterviewDate(updatedInterview.getInterviewDate());

        if (updatedInterview.getMeetingLink() != null)
            interview.setMeetingLink(updatedInterview.getMeetingLink());

        if (updatedInterview.getStatus() != null)
            interview.setStatus(updatedInterview.getStatus());

        if (updatedInterview.getResult() != null)
            interview.setResult(updatedInterview.getResult());

        return interviewRepository.save(interview);
    }
    @Override
    public void deleteInterview(Long id) {
        if (!interviewRepository.existsById(id)) {
            throw new RuntimeException("Interview not found with id: " + id);
        }
        interviewRepository.deleteById(id);
    }

    @Override
    public void cancelInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + interviewId));
        interview.setStatus("Cancelled");
        interviewRepository.save(interview);
    }



    @Override
    public List<Application> filterApplicationsByOffer(Long jobOfferId) {
        JobOffer job = jobOfferRepository.findById(jobOfferId).orElseThrow();
        return job.getApplications();
    }

    @Override
    public void reviewApplication(Long applicationId, String status) {
        Application app = applicationRepository.findById(applicationId).orElseThrow();
        app.setStatus(status);
        applicationRepository.save(app);
    }

    @Override
    public void sendNotification(Notification notification) {
        notification.setSendingDate(new java.util.Date());
        notificationRepository.save(notification);
    }

    @Override
    public int closeExpiredJobOffers() {
        Date now = new Date();
        List<JobOffer> expiredOffers = jobOfferRepository.findExpiredJobOffers(now);
        
        for (JobOffer offer : expiredOffers) {
            offer.setStatus("CLOSED");
            jobOfferRepository.save(offer);
        }
        
        return expiredOffers.size();
    }

    @Override
    public HR updateProfile(Long id, java.util.Map<String, Object> updates) {
        HR existing = hrRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HR not found with id: " + id));

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
        // Note: Email is NOT updatable for HR - it's a company email

        return hrRepository.save(existing);
    }
}
