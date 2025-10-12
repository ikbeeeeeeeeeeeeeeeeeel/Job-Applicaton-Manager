package com.example.applicationsManagement.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Table(name = "job_offre")
public class JobOffer implements Serializable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String location;
    private Double salary;
    private String contractType;
    private String status;
    private String skills;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") // 👈 important
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date publicationDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") // 👈 important
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date deadline;

    @OneToMany(mappedBy = "jobOffer", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Application> applications;

    public void publish() { this.status = "Published"; }
    public void close() { this.status = "Closed"; }
    public void modify(String newTitle, String newDesc) {
        this.title = newTitle;
        this.description = newDesc;
    }
}