package com.example.applicationsManagement.controllers;

import com.example.applicationsManagement.entities.*;
import com.example.applicationsManagement.services.HRService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class HRController {

    private final HRService hrService;

    @GetMapping("/joboffers")
    public List<JobOffer> listAllOffers() {return hrService.listJobOffers();}

    /**
     * EN: Publish a new job offer
     */
    @PostMapping("/joboffers/publish")
    public JobOffer publishJobOffer(@RequestBody JobOffer jobOffer) {
        System.out.println("📥 Received JobOffer: " + jobOffer);
        return hrService.publishJobOffer(jobOffer);
    }

    /**
     * EN: Close an existing job offer
     **/
    @PutMapping("/joboffers/{jobOfferId}/close")
    public ResponseEntity<JobOffer> closeJobOffer(@PathVariable Long jobOfferId) {
        JobOffer closedOffer = hrService.closeJobOffer(jobOfferId);
        return ResponseEntity.ok(closedOffer);
    }

    /**
     * EN: Reopen a closed job offer
     **/
    @PutMapping("/joboffers/{jobOfferId}/open")
    public ResponseEntity<JobOffer> openJobOffer(@PathVariable Long jobOfferId) {
        JobOffer openedOffer = hrService.openJobOffer(jobOfferId);
        return ResponseEntity.ok(openedOffer);
    }

    /**
     * EN: Modify an existing job offer
     */
    @PutMapping("/joboffers/update")
    public JobOffer modifyJobOffer(@RequestBody JobOffer jobOffer) {
        return hrService.modifyJobOffer(jobOffer);
    }

    @DeleteMapping("/joboffers/{id}")
    public ResponseEntity<Void> deleteJobOffer(@PathVariable Long id) {
        hrService.deleteJobOffer(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * EN: Manually trigger closing of expired job offers (for testing/admin use)
     */
    @PostMapping("/joboffers/close-expired")
    public ResponseEntity<?> closeExpiredJobOffers() {
        int closedCount = hrService.closeExpiredJobOffers();
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", closedCount + " expired job offer(s) closed successfully");
        response.put("count", closedCount);
        return ResponseEntity.ok(response);
    }

    /**
     * EN: Plan a meeting/interview
     */
    @PostMapping("/interview/plan")
    public Interview planMeeting(@RequestParam Long candidateId,
                                 @RequestParam Long projectManagerId,
                                 @RequestParam Date date) {
        // In real code: find candidate & PM first, here assume you have them
        return hrService.planMeeting(candidateId, projectManagerId, date);
    }

    @PostMapping(value = "/interview/create", consumes = {"application/json", "application/json;charset=UTF-8"})
    public Interview createInterview(@RequestBody Interview interview,
                                     @RequestParam Long candidateId,
                                     @RequestParam Long projectManagerId,
                                     @RequestParam Long applicationId){
        System.out.println("📥 Received Interview: " + interview);
        return hrService.createInterview(interview, candidateId, projectManagerId, applicationId);
    }

    /**
     * EN: List all interviews
     * FR: Lister tous les entretiens
     */
    @GetMapping("/interviews")
    public List<Interview> listAllInterviews() {
        return hrService.listAllInterviews();
    }

    /**
     * EN: Modify an existing interview
     */
    @PutMapping("/interview/update/{id}")
    public ResponseEntity<Interview> updateInterview(
            @PathVariable Long id,
            @RequestBody Interview updatedInterview,
            @RequestParam(required = false) Long candidateId,
            @RequestParam(required = false) Long projectManagerId) {

        Interview result = hrService.updateInterview(id, updatedInterview, candidateId, projectManagerId);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/interview/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        hrService.deleteInterview(id);
        return ResponseEntity.noContent().build();
    }
    /**
     * EN: Cancel an interview
     */
    @PutMapping("/interview/{id}/cancel")
    public ResponseEntity<?> cancelInterview(@PathVariable Long id) {
        hrService.cancelInterview(id);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Interview cancelled successfully"));
    }


    /**
     * EN: Filter applications by job offer
     */
    @GetMapping("/joboffers/{jobOfferId}/applications")
    public List<Application> filterApplicationsByOffer(@PathVariable Long jobOfferId) {
        return hrService.filterApplicationsByOffer(jobOfferId);
    }

    /**
     * EN: Review an application (change status)
     */
    @PutMapping("/applications/{applicationId}/review")
    public void reviewApplication(@PathVariable Long applicationId, @RequestParam String status) {
        hrService.reviewApplication(applicationId, status);
    }

    /**
     * EN: Send a notification
     * FR: Envoyer une notification
     */
    @PostMapping("/notifications")
    public void sendNotification(@RequestBody Notification notification) {
        hrService.sendNotification(notification);
    }

    /**
     * EN: Update HR profile (email cannot be changed - company email)
     * FR: Mettre à jour le profil RH (l'email ne peut pas être modifié - email de l'entreprise)
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        try {
            HR hr = hrService.updateProfile(id, updates);
            return ResponseEntity.ok(hr);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }
}
