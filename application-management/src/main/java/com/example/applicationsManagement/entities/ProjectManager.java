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
public class ProjectManager extends User implements Serializable {

    private String departement;

    @OneToMany(mappedBy = "recruiter", cascade = CascadeType.ALL)
    private List<Interview> interviews;
}