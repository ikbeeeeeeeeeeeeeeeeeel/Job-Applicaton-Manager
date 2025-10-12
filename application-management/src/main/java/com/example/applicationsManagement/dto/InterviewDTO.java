package com.example.applicationsManagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

@Data
public class InterviewDTO {
    private Long id;

    @NotNull(message = "Interview date is required")
    private Date interviewDate;
    private String meetingLink;
    private String status;

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    @NotNull(message = "Recruiter (Project Manager) ID is required")
    private Long recruiterId;
}
