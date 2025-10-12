package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Interview;
import com.example.applicationsManagement.entities.ProjectManager;

import java.util.List;

public interface ProjectManagerService {
    ProjectManager createPm(ProjectManager pm);
    List<Interview> listMeetings(Long pmId);
    void evaluateInterview(Long interviewId, String comment);
}
