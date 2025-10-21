package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Interview;
import com.example.applicationsManagement.entities.ProjectManager;

import java.util.List;

public interface ProjectManagerService {
    List<ProjectManager> getAllProjectManagers();
    ProjectManager createPm(ProjectManager pm);
    List<Interview> listMeetings(Long pmId);
    void evaluateInterview(Long interviewId, String comment);
    void finalizeApplication(Long interviewId, String decision, String comment);
    ProjectManager updateProfile(Long id, java.util.Map<String, Object> updates);
}
