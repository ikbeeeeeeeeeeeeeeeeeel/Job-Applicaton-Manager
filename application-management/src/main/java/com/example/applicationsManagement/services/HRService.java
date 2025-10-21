package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.*;

import java.util.Date;
import java.util.List;

public interface HRService {
    List<JobOffer> listJobOffers();
    List<Interview> listAllInterviews();
    JobOffer publishJobOffer(JobOffer jobOffer);
    JobOffer closeJobOffer(Long jobOfferId);
    JobOffer openJobOffer(Long jobOfferId);
    JobOffer modifyJobOffer(JobOffer jobOffer);
    void deleteJobOffer(Long id);
    Interview planMeeting(Long candidateId, Long projectManagerId, Date date);
    Interview createInterview(Interview interview, Long candidateId, Long projectManagerId, Long applicationId);
    Interview updateInterview(Long id, Interview updatedInterview, Long candidateId, Long projectManagerId);
    void deleteInterview(Long id);
    void cancelInterview(Long interviewId);

    List<Application> filterApplicationsByOffer(Long jobOfferId);
    void reviewApplication(Long applicationId, String status);
    void sendNotification(Notification notification);
    
    int closeExpiredJobOffers();
    HR updateProfile(Long id, java.util.Map<String, Object> updates);
}
