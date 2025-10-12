package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.repositories.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobOfferServiceImpl implements JobOfferService {
    private final JobOfferRepository jobOfferRepository;

    public List<JobOffer> listAll() {
        return jobOfferRepository.findAll();
    }
}

