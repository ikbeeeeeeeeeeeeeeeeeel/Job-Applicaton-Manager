package com.example.applicationsManagement.controllers;

import com.example.applicationsManagement.entities.Candidate;
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
@CrossOrigin(origins = "*") // For frontend access
public class ProjectManagerController {

    private final ProjectManagerService pmService;

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

}
