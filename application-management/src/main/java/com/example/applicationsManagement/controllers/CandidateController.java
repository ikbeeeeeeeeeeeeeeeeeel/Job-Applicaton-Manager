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
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class CandidateController {

    private final CandidateService candidateService;

    /**
     * EN: List all candidates
     * FR: Lister tous les candidats
     */
    @GetMapping
    public List<Candidate> getAllCandidates() {
        return candidateService.getAllCandidates();
    }

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
    @PostMapping(value = "/apply", consumes = {"application/json", "application/json;charset=UTF-8"})
    public ResponseEntity<?> applyForJob(@RequestBody ApplicationDTO request) {
        try {
            Application application = candidateService.applyForJob(
                    request.getCandidateId(), 
                    request.getJobOfferId(),
                    request.getResume(),
                    request.getCoverLetter());
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
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

    /**
     * EN: Update candidate profile (including optional password change)
     * FR: Mettre à jour le profil du candidat (y compris le changement de mot de passe optionnel)
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        try {
            Candidate candidate = candidateService.updateProfile(id, updates);
            return ResponseEntity.ok(candidate);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }

    /**
     * EN: Update an application (resume and/or cover letter)
     * FR: Mettre à jour une candidature (CV et/ou lettre de motivation)
     */
    @PutMapping("/{candidateId}/applications/{applicationId}")
    public ResponseEntity<?> updateApplication(
            @PathVariable Long candidateId,
            @PathVariable Long applicationId,
            @RequestBody ApplicationDTO request) {
        try {
            Application application = candidateService.updateApplication(
                    applicationId,
                    candidateId,
                    request.getResume(),
                    request.getCoverLetter()
            );
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }

    /**
     * EN: Delete an application
     * FR: Supprimer une candidature
     */
    @DeleteMapping("/{candidateId}/applications/{applicationId}")
    public ResponseEntity<?> deleteApplication(
            @PathVariable Long candidateId,
            @PathVariable Long applicationId) {
        try {
            candidateService.deleteApplication(applicationId, candidateId);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Application deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }
}
