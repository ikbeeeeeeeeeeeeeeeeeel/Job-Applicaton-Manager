package com.example.applicationsManagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

@Data
public class NotificationDTO {
    private Long id;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Content is required")
    private String content;

    private Date sendingDate;
    private String status; // Sent, Read, etc.

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;
}
