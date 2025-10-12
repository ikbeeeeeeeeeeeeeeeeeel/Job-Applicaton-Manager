package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;
import org.springframework.stereotype.Service;

@Service
public class AIScoreServiceImpl implements AIScoreService {

    @Override
    public double analyzeApplication(Application app) {
        return Math.random() * 100;
    }

    @Override
    public String generateReply(Application app) {
        return "Thank you " + app.getCandidate().getFirstname() + "!";
    }
}
