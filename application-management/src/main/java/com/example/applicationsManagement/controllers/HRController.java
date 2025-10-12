package com.example.applicationsManagement.controllers;

import com.example.applicationsManagement.entities.*;
import com.example.applicationsManagement.services.HRService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For frontend access
public class HRController {

    private final HRService hrService;

    @GetMapping("/joboffers")
    public List<JobOffer> listAllOffers() {return hrService.listJobOffers();}

    /**
     * EN: Publish a new job offer
     */
    @PostMapping(value = "/joboffers/publish", consumes = {"application/json", "application/json;charset=UTF-8"})
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
                                     @RequestParam Long projectManagerId){
        System.out.println("📥 Received Interview: " + interview);
        return hrService.createInterview(interview, candidateId, projectManagerId);
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
    public ResponseEntity<String> cancelInterview(@PathVariable Long id) {
        hrService.cancelInterview(id);
        return ResponseEntity.ok("Interview cancelled successfully");
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
}
