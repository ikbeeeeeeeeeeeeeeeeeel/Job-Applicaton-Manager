package com.example.applicationsManagement.controllers;

import com.example.applicationsManagement.dto.ApplicationDTO;
import com.example.applicationsManagement.entities.Application;
import com.example.applicationsManagement.entities.Candidate;
import com.example.applicationsManagement.entities.Interview;
import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.services.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For frontend access
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping("/{id}")
    public Candidate getCandidate(@PathVariable Long id) {
        return candidateService.getCandidateById(id);
    }

    @PostMapping(value = "/create", consumes = "application/json")
    public Candidate createCandidate(@RequestBody Candidate candidate) {
        return candidateService.createCandidate(candidate);
    }
    /**
     * EN: Search job offers by keyword
     * FR: Rechercher des offres d'emploi par mot-clé
     */
    @GetMapping("/search")
    public List<JobOffer> searchJobs(@RequestParam(required = false) String keyword) {
        return candidateService.searchJobs(keyword);
    }

    /**
     * EN: Apply for a job offer
     * FR: Postuler à une offre d'emploi
     */
    @PostMapping("/apply")
    public ResponseEntity<Application> applyForJob(@RequestBody ApplicationDTO request) {
        Application application = candidateService.applyForJob(
                request.getCandidateId(), request.getJobOfferId());
        return ResponseEntity.ok(application);
    }

    /**
     * EN: List applications for this candidate
     * FR: Lister les candidatures pour ce candidat
     */
    @GetMapping("/{candidateId}/applications")
    public List<Application> getCandidateApplications(@PathVariable Long candidateId) {
        return candidateService.getApplicationsByCandidate(candidateId);
    }

    /**
     * EN: List interviews for this candidate
     * FR: Lister les entretiens pour ce candidat
     */
    @GetMapping("/{candidateId}/interviews")
    public List<Interview> listInterviews(@PathVariable Long candidateId) {
        return candidateService.listInterviews(candidateId);
    }
}
