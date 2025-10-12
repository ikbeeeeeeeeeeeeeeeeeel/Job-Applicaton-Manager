package com.example.applicationsManagement.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class Application implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate submissionDate;
    private String status;
    private Double score;
    private String aiScoreExplanation;

    @ManyToOne
    @JsonIgnore
    private Candidate candidate;

    @ManyToOne
    @JoinColumn(name = "job_offer_id")
    @JsonBackReference
    private JobOffer jobOffer;

    public void updateStatus(String newStatus) {
        this.status = newStatus;
    }
}
