package com.example.applicationsManagement.services;

import com.example.applicationsManagement.dto.CreateUserRequest;
import com.example.applicationsManagement.dto.UserDTO;
import com.example.applicationsManagement.entities.Admin;
import com.example.applicationsManagement.entities.Candidate;
import com.example.applicationsManagement.entities.HR;
import com.example.applicationsManagement.entities.ProjectManager;
import com.example.applicationsManagement.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin Service Implementation
 * 
 * Implements business logic for admin operations
 * Handles user creation, management, and system statistics
 */
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final HRRepository hrRepository;
    private final ProjectManagerRepository projectManagerRepository;
    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    public Admin getAdminById(Long id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + id));
    }

    @Override
    public UserDTO createHRUser(CreateUserRequest request) {
        // Check if email or username already exists
        if (hrRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (hrRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Create new HR user
        HR hr = new HR();
        hr.setUsername(request.getUsername());
        hr.setEmail(request.getEmail());
        hr.setPassword(request.getPassword());  // TODO: Hash password with BCrypt
        hr.setFirstname(request.getFirstname());
        hr.setLastname(request.getLastname());
        hr.setDepartement(request.getDepartment());
        hr.setPhone(request.getPhone());
        hr.setEducation(request.getEducation());
        // Role will be set automatically by @PrePersist

        HR savedHR = hrRepository.save(hr);

        // Convert to DTO
        return mapToDTO(savedHR);
    }

    @Override
    public UserDTO createPMUser(CreateUserRequest request) {
        // Check if email or username already exists
        if (projectManagerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (projectManagerRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Create new Project Manager user
        ProjectManager pm = new ProjectManager();
        pm.setUsername(request.getUsername());
        pm.setEmail(request.getEmail());
        pm.setPassword(request.getPassword());  // TODO: Hash password with BCrypt
        pm.setFirstname(request.getFirstname());
        pm.setLastname(request.getLastname());
        pm.setDepartement(request.getDepartment());
        pm.setPhone(request.getPhone());
        pm.setEducation(request.getEducation());
        // Role will be set automatically by @PrePersist

        ProjectManager savedPM = projectManagerRepository.save(pm);

        // Convert to DTO
        return mapToDTO(savedPM);
    }

    @Override
    public List<UserDTO> getAllHRUsers() {
        return hrRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getAllPMUsers() {
        return projectManagerRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getAllCandidates() {
        return candidateRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long userId, String role) {
        switch (role.toUpperCase()) {
            case "HR":
                if (!hrRepository.existsById(userId)) {
                    throw new RuntimeException("HR user not found");
                }
                hrRepository.deleteById(userId);
                break;
            case "PM":
                if (!projectManagerRepository.existsById(userId)) {
                    throw new RuntimeException("PM user not found");
                }
                projectManagerRepository.deleteById(userId);
                break;
            case "CANDIDATE":
                if (!candidateRepository.existsById(userId)) {
                    throw new RuntimeException("Candidate not found");
                }
                candidateRepository.deleteById(userId);
                break;
            default:
                throw new RuntimeException("Invalid role specified");
        }
    }

    @Override
    public UserDTO updateUser(Long userId, String role, CreateUserRequest request) {
        switch (role.toUpperCase()) {
            case "HR":
                HR hr = hrRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("HR user not found"));
                updateHRFromRequest(hr, request);
                return mapToDTO(hrRepository.save(hr));
                
            case "PM":
                ProjectManager pm = projectManagerRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("PM user not found"));
                updatePMFromRequest(pm, request);
                return mapToDTO(projectManagerRepository.save(pm));
                
            default:
                throw new RuntimeException("Only HR and PM can be updated by admin");
        }
    }

    @Override
    public void resetPassword(Long userId, String role, String newPassword) {
        // TODO: Hash password with BCrypt before saving
        switch (role.toUpperCase()) {
            case "HR":
                HR hr = hrRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("HR user not found"));
                hr.setPassword(newPassword);
                hrRepository.save(hr);
                break;
                
            case "PM":
                ProjectManager pm = projectManagerRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("PM user not found"));
                pm.setPassword(newPassword);
                projectManagerRepository.save(pm);
                break;
                
            case "CANDIDATE":
                Candidate candidate = candidateRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("Candidate not found"));
                candidate.setPassword(newPassword);
                candidateRepository.save(candidate);
                break;
                
            default:
                throw new RuntimeException("Invalid role specified");
        }
    }

    @Override
    public Map<String, Object> getSystemStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // User counts
        stats.put("totalCandidates", candidateRepository.count());
        stats.put("totalHR", hrRepository.count());
        stats.put("totalPM", projectManagerRepository.count());
        stats.put("totalAdmins", adminRepository.count());
        
        // Job and application counts
        stats.put("totalJobOffers", jobOfferRepository.count());
        stats.put("totalApplications", applicationRepository.count());
        
        // Calculate total users
        long totalUsers = candidateRepository.count() + hrRepository.count() + 
                         projectManagerRepository.count() + adminRepository.count();
        stats.put("totalUsers", totalUsers);
        
        return stats;
    }

    // Helper methods to map entities to DTOs
    
    private UserDTO mapToDTO(HR hr) {
        UserDTO dto = new UserDTO();
        dto.setId(hr.getId());
        dto.setUsername(hr.getUsername());
        dto.setEmail(hr.getEmail());
        dto.setRole(hr.getRole());
        dto.setFirstname(hr.getFirstname());
        dto.setLastname(hr.getLastname());
        dto.setDepartment(hr.getDepartement());
        dto.setPhone(hr.getPhone());
        dto.setEducation(hr.getEducation());
        return dto;
    }

    private UserDTO mapToDTO(ProjectManager pm) {
        UserDTO dto = new UserDTO();
        dto.setId(pm.getId());
        dto.setUsername(pm.getUsername());
        dto.setEmail(pm.getEmail());
        dto.setRole(pm.getRole());
        dto.setFirstname(pm.getFirstname());
        dto.setLastname(pm.getLastname());
        dto.setDepartment(pm.getDepartement());
        dto.setPhone(pm.getPhone());
        dto.setEducation(pm.getEducation());
        return dto;
    }

    private UserDTO mapToDTO(Candidate candidate) {
        UserDTO dto = new UserDTO();
        dto.setId(candidate.getId());
        dto.setUsername(candidate.getUsername());
        dto.setEmail(candidate.getEmail());
        dto.setRole(candidate.getRole());
        dto.setFirstname(candidate.getFirstname());
        dto.setLastname(candidate.getLastname());
        dto.setPhone(candidate.getPhone());
        return dto;
    }

    private void updateHRFromRequest(HR hr, CreateUserRequest request) {
        if (request.getUsername() != null) hr.setUsername(request.getUsername());
        if (request.getEmail() != null) hr.setEmail(request.getEmail());
        if (request.getFirstname() != null) hr.setFirstname(request.getFirstname());
        if (request.getLastname() != null) hr.setLastname(request.getLastname());
        if (request.getDepartment() != null) hr.setDepartement(request.getDepartment());
        if (request.getPhone() != null) hr.setPhone(request.getPhone());
        if (request.getEducation() != null) hr.setEducation(request.getEducation());
    }

    private void updatePMFromRequest(ProjectManager pm, CreateUserRequest request) {
        if (request.getUsername() != null) pm.setUsername(request.getUsername());
        if (request.getEmail() != null) pm.setEmail(request.getEmail());
        if (request.getFirstname() != null) pm.setFirstname(request.getFirstname());
        if (request.getLastname() != null) pm.setLastname(request.getLastname());
        if (request.getDepartment() != null) pm.setDepartement(request.getDepartment());
        if (request.getPhone() != null) pm.setPhone(request.getPhone());
        if (request.getEducation() != null) pm.setEducation(request.getEducation());
    }
}
