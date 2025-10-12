package com.example.applicationsManagement.controllers;

import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.services.JobOfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/joboffers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For frontend access
public class JobOfferController {

    private final JobOfferService jobOfferService;

    /**
     * List all job offers
     */
    @GetMapping
    public List<JobOffer> listAllJobOffers() {
        return jobOfferService.listAll();
    }
}