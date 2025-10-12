package com.example.applicationsManagement.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
@Entity
public class Candidate extends User implements Serializable{
    private String firstname;
    private String lastname;
    private Long phone;
    private String resume;
    private String coverLetter;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Application> applications;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL)
    private List<Interview> interviews;
}