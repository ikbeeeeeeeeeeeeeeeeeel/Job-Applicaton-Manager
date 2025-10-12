package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;
import com.example.applicationsManagement.repositories.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {
    private final ApplicationRepository applicationRepository;

    @Override
    public void updateApplicationStatus(Long applicationId, String status) {
        Application app = applicationRepository.findById(applicationId).orElseThrow();
        app.setStatus(status);
        applicationRepository.save(app);
    }
}

