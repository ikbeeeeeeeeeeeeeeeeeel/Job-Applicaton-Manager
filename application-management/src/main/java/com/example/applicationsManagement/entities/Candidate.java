package com.example.applicationsManagement.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class Candidate extends User {
    // firstname and lastname inherited from User class
    private Long phone;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String resume;  // Stored as Base64 string (supports up to 4GB)
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String coverLetter;  // Stored as Base64 string (supports up to 4GB)

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL)
    @OrderBy("submissionDate DESC")
    @JsonIgnoreProperties({"candidate", "jobOffer"})
    private List<Application> applications;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL)
    @OrderBy("interviewDate DESC")
    @JsonIgnoreProperties("candidate")
    private List<Interview> interviews;
    
    /**
     * Automatically set role to CANDIDATE before persisting to database
     */
    @PrePersist
    public void prePersist() {
        if (this.getRole() == null || this.getRole().isEmpty()) {
            this.setRole("CANDIDATE");
        }
    }
}