package com.example.applicationsManagement.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class Interview implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm") // 👈 important
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private Date interviewDate;
    private String meetingLink;
    private String status;
    private String result;

    @ManyToOne
    @JsonIgnoreProperties({"interviews", "password"}) // prevent infinite loop + hide sensitive fields
    private ProjectManager recruiter;

    @ManyToOne
    @JsonIgnoreProperties({"interviews", "password", "resume", "coverLetter"}) // prevent infinite loop + hide sensitive fields
    private Candidate candidate;
}