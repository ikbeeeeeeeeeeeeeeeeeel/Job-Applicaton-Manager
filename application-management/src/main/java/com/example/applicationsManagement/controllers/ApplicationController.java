package com.example.applicationsManagement.controllers;

import com.example.applicationsManagement.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For frontend access
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     Update application status
     **/
    @PutMapping("/{applicationId}/status")
    public void updateApplicationStatus(@PathVariable Long applicationId, @RequestParam String status) {
        applicationService.updateApplicationStatus(applicationId, status);
    }
}
