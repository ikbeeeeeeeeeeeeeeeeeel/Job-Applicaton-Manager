package com.example.applicationsManagement.controllers;

import com.example.applicationsManagement.entities.Interview;
import com.example.applicationsManagement.entities.ProjectManager;
import com.example.applicationsManagement.services.ProjectManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projectmanagers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ProjectManagerController {

    private final ProjectManagerService pmService;

    /**
     * EN: List all project managers
     * FR: Lister tous les chefs de projet
     */
    @GetMapping
    public List<ProjectManager> getAllProjectManagers() {
        return pmService.getAllProjectManagers();
    }

    @PostMapping("/create")
    public ProjectManager createPm(@RequestBody ProjectManager pm) {
        return pmService.createPm(pm);
    }

    /**
     * EN: List meetings/interviews for this project manager
     */
    @GetMapping("/{pmId}/interviews")
    public List<Interview> listMeetings(@PathVariable Long pmId) {
        return pmService.listMeetings(pmId);
    }

    /**
     * EN: Evaluate an interview (add comment or mark as evaluated)
     */
    @PutMapping("/interviews/{interviewId}/evaluate")
    public ResponseEntity<?> evaluateInterview(@PathVariable Long interviewId, @RequestParam String comment) {
        pmService.evaluateInterview(interviewId, comment);
        return ResponseEntity.ok("Evaluation updated");
    }

    /**
     * EN: Finalize application after interview (ACCEPTED or REJECTED)
     * FR: Finaliser la candidature après l'entretien (ACCEPTÉ ou REJETÉ)
     */
    @PutMapping("/interviews/{interviewId}/finalize")
    public ResponseEntity<?> finalizeApplication(
            @PathVariable Long interviewId, 
            @RequestParam String decision,
            @RequestParam(required = false) String comment) {
        pmService.finalizeApplication(interviewId, decision, comment != null ? comment : "");
        return ResponseEntity.ok("Application finalized successfully");
    }

    /**
     * EN: Update PM profile (email cannot be changed - company email)
     * FR: Mettre à jour le profil PM (l'email ne peut pas être modifié - email de l'entreprise)
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        try {
            ProjectManager pm = pmService.updateProfile(id, updates);
            return ResponseEntity.ok(pm);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }
}
