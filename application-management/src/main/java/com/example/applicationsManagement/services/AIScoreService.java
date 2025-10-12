package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;

public interface AIScoreService {
    double analyzeApplication(Application app);
    String generateReply(Application app);
}