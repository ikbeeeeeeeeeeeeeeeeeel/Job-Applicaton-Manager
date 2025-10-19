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
    private Long phone;
    private String education;

    @OneToMany(mappedBy = "recruiter", cascade = CascadeType.ALL)
    @OrderBy("interviewDate DESC")
    @JsonIgnore
    private List<Interview> interviews;
    
    /**
     * Automatically set role to PM before persisting to database
     */
    @PrePersist
    public void prePersist() {
        if (this.getRole() == null || this.getRole().isEmpty()) {
            this.setRole("PM");
        }
    }
}