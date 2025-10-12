package com.example.applicationsManagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplicationDTO {
    private Long id;

    @NotBlank(message = "Status is required")
    private String status;
    private Double score;
    private Long candidateId;
    private Long jobOfferId;
}
