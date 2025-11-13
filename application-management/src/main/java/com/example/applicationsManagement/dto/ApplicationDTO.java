package com.example.applicationsManagement.dto;

import lombok.Data;

@Data
public class ApplicationDTO {
    private Long id;
    private String status;
    private Double score;
    private Long candidateId;
    private Long jobOfferId;
    private String resume;  // Base64 encoded resume (optional - can use candidate's default)
    private String coverLetter;  // Base64 encoded cover letter (optional)
}
