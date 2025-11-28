// Package declaration - defines where this class belongs in the project structure
package com.example.applicationsManagement.controllers;

// ===== IMPORTS =====
// Import custom DTOs (Data Transfer Objects) for request/response handling
import com.example.applicationsManagement.dto.CreateUserRequest; // Contains registration data from frontend
import com.example.applicationsManagement.dto.LoginRequest;   // Contains login credentials from frontend
import com.example.applicationsManagement.dto.LoginResponse;  // Contains user data to send back to frontend

// Import entity classes that represent database tables
import com.example.applicationsManagement.entities.Admin;            // Admin user type
import com.example.applicationsManagement.entities.Candidate;        // Candidate user type
import com.example.applicationsManagement.entities.HR;               // HR user type
import com.example.applicationsManagement.entities.ProjectManager;   // Project Manager user type

// Import repositories for database operations
import com.example.applicationsManagement.repositories.AdminRepository;            // Access admin table
import com.example.applicationsManagement.repositories.CandidateRepository;        // Access candidate table
import com.example.applicationsManagement.repositories.HRRepository;               // Access hr table
import com.example.applicationsManagement.repositories.ProjectManagerRepository;   // Access project_manager table

// Spring Framework imports for dependency injection and web functionality
import org.springframework.beans.factory.annotation.Autowired;  // Automatic dependency injection
import org.springframework.http.HttpStatus;                      // HTTP status codes (200, 401, 500, etc.)
import org.springframework.http.ResponseEntity;                  // Wrapper for HTTP responses
import org.springframework.web.bind.annotation.*;                // REST controller annotations

// Security imports
import com.example.applicationsManagement.security.JwtUtil;     // JWT token utility

// Java utility imports
import java.util.HashMap;   // For creating key-value error messages
import java.util.Map;       // Interface for key-value pairs
import java.util.Optional;  // Container that may or may not contain a value (prevents null)

/**
 * ===== AUTH CONTROLLER =====
 * 
 * PURPOSE:
 * This controller handles user authentication (login) for the entire application.
 * It supports three types of users: Candidates, HR, and Project Managers.
 * 
 * FEATURES:
 * - Login with email OR username (flexible authentication)
 * - Role-based authentication (different user types)
 * - Returns user data on successful login
 * - Returns error messages on failed login
 * 
 * API ENDPOINT:
 * POST /api/auth/login
 * 
 * REQUEST EXAMPLE:
 * {
 *   "emailOrUsername": "john@example.com",
 *   "password": "password123",
 *   "role": "CANDIDATE"
 * }
 * 
 * RESPONSE EXAMPLE (Success):
 * {
 *   "id": 1,
 *   "email": "john@example.com",
 *   "username": "johndoe",
 *   "role": "CANDIDATE",
 *   "firstname": "John",
 *   "lastname": "Doe",
 *   "token": null
 * }
 */

// @RestController: Marks this class as a REST API controller
// Automatically converts Java objects to JSON for HTTP responses
@RestController

// @RequestMapping: Defines the base URL path for all endpoints in this controller
// All methods in this class will start with "/api/auth"
// Example: login method becomes "/api/auth/login"
@RequestMapping("/api/auth")

// @CrossOrigin: Allows frontend (React) to call this API from a different port
// Without this, browser blocks requests due to CORS (Cross-Origin Resource Sharing) policy
// "http://localhost:5173" is where your React frontend runs
@CrossOrigin(origins = "http://localhost:5173")

public class AuthController {

    // ===== DEPENDENCY INJECTION =====
    // Spring automatically creates and injects these repository instances
    // We don't use "new CandidateRepository()" - Spring does it for us
    
    // @Autowired: Tells Spring to automatically inject the CandidateRepository
    // This repository provides methods to interact with the candidate table
    @Autowired
    private CandidateRepository candidateRepository;

    // Repository for accessing hr table in database
    @Autowired
    private HRRepository hrRepository;

    // Repository for accessing project_manager table in database
    @Autowired
    private ProjectManagerRepository projectManagerRepository;

    // Repository for accessing admin table in database
    @Autowired
    private AdminRepository adminRepository;
    
    // JWT utility for generating tokens
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * ===== LOGIN METHOD =====
     * 
     * This is the main entry point for user authentication
     * 
     * HOW IT WORKS:
     * 1. Frontend sends POST request to /api/auth/login
     * 2. Request body contains: emailOrUsername, password, role
     * 3. This method extracts those values
     * 4. Routes to correct authentication method based on role
     * 5. Returns success (user data) or error message
     * 
     * @param loginRequest - Object containing login credentials from frontend
     * @return ResponseEntity - HTTP response with user data or error
     */
    
    // @PostMapping: This method handles POST requests to "/api/auth/login"
    // POST is used (not GET) because we're sending sensitive data (password)
    @PostMapping("/login")
    
    // ResponseEntity<?> - The "?" means it can return any type of object
    // We return either LoginResponse (success) or error Map (failure)
    // @RequestBody - Tells Spring to convert incoming JSON to LoginRequest object
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        
        // STEP 1: Extract login credentials from the request object
        // loginRequest.getEmailOrUsername() gets either email or username from frontend
        String emailOrUsername = loginRequest.getEmailOrUsername();
        
        // Extract password (plain text for now, should be encrypted in production)
        String password = loginRequest.getPassword();
        
        // Extract role to determine which type of user is trying to login
        // Can be: "CANDIDATE", "HR", or "PM"
        String role = loginRequest.getRole();

        // STEP 2: Try to authenticate - wrap in try-catch for error handling
        try {
            // STEP 3: Use switch statement to route to correct authentication method
            // Each user type (Candidate, HR, PM) has its own table and authentication logic
            switch (role) {
                // If role is "CANDIDATE", call authenticateCandidate method
                case "CANDIDATE":
                    return authenticateCandidate(emailOrUsername, password);
                
                // If role is "HR", call authenticateHR method
                case "HR":
                    return authenticateHR(emailOrUsername, password);
                
                // If role is "PM" (Project Manager), call authenticatePM method
                case "PM":
                    return authenticatePM(emailOrUsername, password);
                
                // If role is "ADMIN", call authenticateAdmin method
                case "ADMIN":
                    return authenticateAdmin(emailOrUsername, password);
                
                // If role is none of the above, return error
                default:
                    // ResponseEntity.status() sets HTTP status code
                    // HttpStatus.BAD_REQUEST = 400 (client error)
                    return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Invalid role specified"));
            }
        } catch (Exception e) {
            // STEP 4: If any error occurs during authentication
            // (database error, null pointer, etc.), return 500 error
            
            // HttpStatus.INTERNAL_SERVER_ERROR = 500 (server error)
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Login failed: " + e.getMessage()));
        }
    }

    /**
     * ===== REGISTER METHOD =====
     * 
     * This endpoint allows new users to register in the system
     * Supports CANDIDATE, HR, PM, and ADMIN roles
     * 
     * @param request - Registration data from frontend
     * @return ResponseEntity with success message or error
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CreateUserRequest request) {
        try {
            // Validate required fields
            if (request.getUsername() == null || request.getEmail() == null || 
                request.getPassword() == null || request.getRole() == null) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Missing required fields"));
            }

            // Check if username already exists
            if (candidateRepository.findByUsername(request.getUsername()).isPresent() ||
                hrRepository.findByUsername(request.getUsername()).isPresent() ||
                projectManagerRepository.findByUsername(request.getUsername()).isPresent() ||
                adminRepository.findByUsername(request.getUsername()).isPresent()) {
                return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(createErrorResponse("Username already exists"));
            }

            // Check if email already exists
            if (candidateRepository.findByEmail(request.getEmail()).isPresent() ||
                hrRepository.findByEmail(request.getEmail()).isPresent() ||
                projectManagerRepository.findByEmail(request.getEmail()).isPresent() ||
                adminRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(createErrorResponse("Email already exists"));
            }

            // Create user based on role
            String role = request.getRole().toUpperCase();
            
            switch (role) {
                case "CANDIDATE":
                    Candidate candidate = new Candidate();
                    candidate.setUsername(request.getUsername());
                    candidate.setEmail(request.getEmail());
                    candidate.setPassword(request.getPassword()); // Note: Should hash in production
                    candidate.setRole("ROLE_CANDIDATE");
                    candidate.setFirstname(request.getFirstname());
                    candidate.setLastname(request.getLastname());
                    candidate.setPhone(request.getPhone());
                    candidateRepository.save(candidate);
                    break;

                case "HR":
                    HR hr = new HR();
                    hr.setUsername(request.getUsername());
                    hr.setEmail(request.getEmail());
                    hr.setPassword(request.getPassword());
                    hr.setRole("ROLE_HR");
                    hr.setFirstname(request.getFirstname());
                    hr.setLastname(request.getLastname());
                    hr.setPhone(request.getPhone());
                    hr.setDepartement(request.getDepartment());
                    hr.setEducation(request.getEducation());
                    hrRepository.save(hr);
                    break;

                case "PM":
                    ProjectManager pm = new ProjectManager();
                    pm.setUsername(request.getUsername());
                    pm.setEmail(request.getEmail());
                    pm.setPassword(request.getPassword());
                    pm.setRole("ROLE_PM");
                    pm.setFirstname(request.getFirstname());
                    pm.setLastname(request.getLastname());
                    pm.setPhone(request.getPhone());
                    pm.setDepartement(request.getDepartment());
                    pm.setEducation(request.getEducation());
                    projectManagerRepository.save(pm);
                    break;

                case "ADMIN":
                    Admin admin = new Admin();
                    admin.setUsername(request.getUsername());
                    admin.setEmail(request.getEmail());
                    admin.setPassword(request.getPassword());
                    admin.setRole("ROLE_ADMIN");
                    admin.setFirstname(request.getFirstname());
                    admin.setLastname(request.getLastname());
                    admin.setPhone(request.getPhone());
                    admin.setDepartment(request.getDepartment());
                    adminRepository.save(admin);
                    break;

                default:
                    return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Invalid role. Must be CANDIDATE, HR, PM, or ADMIN"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("username", request.getUsername());
            response.put("role", role);
            
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Registration failed: " + e.getMessage()));
        }
    }

    /**
     * ===== AUTHENTICATE CANDIDATE =====
     * 
     * This method verifies if a candidate's credentials are correct
     * 
     * AUTHENTICATION FLOW:
     * 1. Try to find user by email in database
     * 2. If not found, try to find by username
     * 3. If still not found, return "user not found" error
     * 4. If found, verify the password matches
     * 5. If password wrong, return "invalid credentials" error
     * 6. If everything correct, return user data
     * 
     * WHY CHECK BOTH EMAIL AND USERNAME:
     * Provides flexibility - users can login with either credential
     * 
     * @param emailOrUsername - What user entered (could be email or username)
     * @param password - User's password (plain text, needs to be hashed in production)
     * @return ResponseEntity with user data (success) or error message (failure)
     */
    private ResponseEntity<?> authenticateCandidate(String emailOrUsername, String password) {
        
        // ===== STEP 1: FIND USER IN DATABASE =====
        
        // Optional<Candidate> is a container that either:
        // - Contains a Candidate object (if found)
        // - Is empty (if not found)
        // This prevents NullPointerException errors
        
        // Try searching by EMAIL first
        // candidateRepository.findByEmail() is a Spring Data JPA method
        // It generates SQL: SELECT * FROM candidate WHERE email = ?
        Optional<Candidate> candidateOpt = candidateRepository.findByEmail(emailOrUsername);
        
        // STEP 2: If email search returned nothing, try USERNAME
        // isPresent() returns true if Optional contains a value, false if empty
        if (!candidateOpt.isPresent()) {
            // Try searching by USERNAME
            // Generates SQL: SELECT * FROM candidate WHERE username = ?
            candidateOpt = candidateRepository.findByUsername(emailOrUsername);
        }

        // ===== STEP 3: CHECK IF USER EXISTS =====
        // If still empty after both searches, user doesn't exist
        if (!candidateOpt.isPresent()) {
            // Return 401 UNAUTHORIZED status code
            // Don't specify if email/username was wrong (security best practice)
            // Just say "invalid credentials" to not give hints to attackers
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)  // HTTP 401
                .body(createErrorResponse("Invalid email/username or password"));
        }

        // ===== STEP 4: EXTRACT CANDIDATE FROM OPTIONAL =====
        // .get() retrieves the Candidate object from Optional
        // Safe to call here because we checked isPresent() above
        Candidate candidate = candidateOpt.get();

        // ===== STEP 5: VERIFY PASSWORD =====
        // Compare entered password with stored password
        // ⚠️ SECURITY WARNING: This uses plain text comparison
        // ⚠️ PRODUCTION: Use BCrypt password hashing
        // Example: if (!encoder.matches(password, candidate.getPassword()))
        if (!candidate.getPassword().equals(password)) {
            // Password doesn't match - return same error as "user not found"
            // Don't tell attacker if username was correct (security)
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)  // HTTP 401
                .body(createErrorResponse("Invalid email/username or password"));
        }

        // ===== STEP 6: GENERATE JWT TOKEN =====
        String token = jwtUtil.generateToken(
            candidate.getUsername(),
            candidate.getRole(),
            candidate.getId()
        );
        
        // ===== STEP 7: CREATE SUCCESS RESPONSE =====
        // Authentication successful! Build response with user data
        
        // LoginResponse is a DTO that contains user information
        // This will be converted to JSON and sent to frontend
        LoginResponse response = new LoginResponse(
            candidate.getId(),          // Database ID: 1, 2, 3, etc.
            candidate.getEmail(),       // User's email address
            candidate.getUsername(),    // User's username
            candidate.getRole(),        // "CANDIDATE" - from database
            candidate.getFirstname(),   // User's first name
            candidate.getLastname(),    // User's last name
            token                       // JWT token for authentication
        );

        // Return HTTP 200 OK with user data
        // ResponseEntity.ok() is shorthand for status(HttpStatus.OK).body()
        // Frontend will receive JSON like: {"id": 1, "email": "...", "role": "CANDIDATE", "token": "...", ...}
        return ResponseEntity.ok(response);
    }

    /**
     * Authenticate HR by email or username
     * Checks both email and username fields
     */
    private ResponseEntity<?> authenticateHR(String emailOrUsername, String password) {
        // Try to find by email first
        Optional<HR> hrOpt = hrRepository.findByEmail(emailOrUsername);
        
        // If not found by email, try username
        if (!hrOpt.isPresent()) {
            hrOpt = hrRepository.findByUsername(emailOrUsername);
        }

        // Check if HR exists
        if (!hrOpt.isPresent()) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Invalid email/username or password"));
        }

        HR hr = hrOpt.get();

        // Verify password
        // TODO: Use BCrypt in production
        if (!hr.getPassword().equals(password)) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Invalid email/username or password"));
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
            hr.getUsername(),
            hr.getRole(),
            hr.getId()
        );
        
        // Create successful login response
        LoginResponse response = new LoginResponse(
            hr.getId(),
            hr.getEmail(),
            hr.getUsername(),
            hr.getRole(),
            hr.getFirstname(),
            hr.getLastname(),
            token
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Authenticate Project Manager by email or username
     * Checks both email and username fields
     */
    private ResponseEntity<?> authenticatePM(String emailOrUsername, String password) {
        // Try to find by email first
        Optional<ProjectManager> pmOpt = projectManagerRepository.findByEmail(emailOrUsername);
        
        // If not found by email, try username
        if (!pmOpt.isPresent()) {
            pmOpt = projectManagerRepository.findByUsername(emailOrUsername);
        }

        // Check if PM exists
        if (!pmOpt.isPresent()) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Invalid email/username or password"));
        }

        ProjectManager pm = pmOpt.get();

        // Verify password
        // TODO: Use BCrypt in production
        if (!pm.getPassword().equals(password)) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Invalid email/username or password"));
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
            pm.getUsername(),
            pm.getRole(),
            pm.getId()
        );
        
        // Create successful login response
        LoginResponse response = new LoginResponse(
            pm.getId(),
            pm.getEmail(),
            pm.getUsername(),
            pm.getRole(),
            pm.getFirstname(),
            pm.getLastname(),
            token
        );

        return ResponseEntity.ok(response);
    }

    /**
     * ===== AUTHENTICATE ADMIN =====
     * 
     * Authenticate Admin by email or username
     * Similar to other authentication methods but for admins
     * 
     * @param emailOrUsername - Email or username entered
     * @param password - Admin's password
     * @return ResponseEntity with admin data or error
     */
    private ResponseEntity<?> authenticateAdmin(String emailOrUsername, String password) {
        // Try to find by email first
        Optional<Admin> adminOpt = adminRepository.findByEmail(emailOrUsername);
        
        // If not found by email, try username
        if (!adminOpt.isPresent()) {
            adminOpt = adminRepository.findByUsername(emailOrUsername);
        }

        // Check if admin exists
        if (!adminOpt.isPresent()) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Invalid email/username or password"));
        }

        Admin admin = adminOpt.get();

        // Verify password
        // TODO: Use BCrypt in production
        if (!admin.getPassword().equals(password)) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Invalid email/username or password"));
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
            admin.getUsername(),
            admin.getRole(),
            admin.getId()
        );
        
        // Create successful login response
        LoginResponse response = new LoginResponse(
            admin.getId(),
            admin.getEmail(),
            admin.getUsername(),
            admin.getRole(),  // Get role from User entity (should be "ADMIN")
            admin.getFirstname(),
            admin.getLastname(),
            token
        );

        return ResponseEntity.ok(response);
    }

    /**
     * ===== CREATE ERROR RESPONSE =====
     * 
     * Helper method to create consistent error messages for all authentication failures
     * 
     * WHY USE THIS:
     * - Provides standardized error format across all endpoints
     * - Makes frontend error handling easier
     * - DRY principle (Don't Repeat Yourself)
     * 
     * WHAT IT DOES:
     * Creates a Map (key-value pairs) with error message
     * Spring automatically converts this to JSON
     * 
     * EXAMPLE OUTPUT:
     * {
     *   "message": "Invalid email/username or password"
     * }
     * 
     * @param message - The error message to send to frontend
     * @return Map containing the error message in "message" key
     */
    private Map<String, String> createErrorResponse(String message) {
        // Create a new HashMap to store key-value pairs
        // HashMap is a Java collection that stores data as {key: value}
        Map<String, String> error = new HashMap<>();
        
        // Add the error message with key "message"
        // Frontend can access this as: response.message
        // Result will be JSON: {"message": "error text here"}
        error.put("message", message);
        
        // Return the Map
        // Spring will automatically convert this to JSON before sending to frontend
        return error;
    }

    /**
     * ===== CHANGE PASSWORD ENDPOINT =====
     * 
     * PURPOSE: Allows users to change their password
     * 
     * API ENDPOINT: PUT /api/auth/change-password
     * 
     * REQUEST BODY:
     * {
     *   "userId": 1,
     *   "role": "CANDIDATE",
     *   "currentPassword": "oldpass123",
     *   "newPassword": "newpass456"
     * }
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            Long userId = Long.parseLong(request.get("userId"));
            String role = request.get("role");
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            // Validate new password
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("New password must be at least 6 characters long"));
            }

            // Find user based on role and verify current password
            boolean passwordVerified = false;
            boolean passwordUpdated = false;

            if ("CANDIDATE".equalsIgnoreCase(role)) {
                Optional<Candidate> candidateOpt = candidateRepository.findById(userId);
                if (candidateOpt.isPresent()) {
                    Candidate candidate = candidateOpt.get();
                    if (candidate.getPassword().equals(currentPassword)) {
                        passwordVerified = true;
                        candidate.setPassword(newPassword);
                        candidateRepository.save(candidate);
                        passwordUpdated = true;
                    }
                }
            } else if ("HR".equalsIgnoreCase(role)) {
                Optional<HR> hrOpt = hrRepository.findById(userId);
                if (hrOpt.isPresent()) {
                    HR hr = hrOpt.get();
                    if (hr.getPassword().equals(currentPassword)) {
                        passwordVerified = true;
                        hr.setPassword(newPassword);
                        hrRepository.save(hr);
                        passwordUpdated = true;
                    }
                }
            } else if ("PM".equalsIgnoreCase(role)) {
                Optional<ProjectManager> pmOpt = projectManagerRepository.findById(userId);
                if (pmOpt.isPresent()) {
                    ProjectManager pm = pmOpt.get();
                    if (pm.getPassword().equals(currentPassword)) {
                        passwordVerified = true;
                        pm.setPassword(newPassword);
                        projectManagerRepository.save(pm);
                        passwordUpdated = true;
                    }
                }
            } else if ("ADMIN".equalsIgnoreCase(role)) {
                Optional<Admin> adminOpt = adminRepository.findById(userId);
                if (adminOpt.isPresent()) {
                    Admin admin = adminOpt.get();
                    if (admin.getPassword().equals(currentPassword)) {
                        passwordVerified = true;
                        admin.setPassword(newPassword);
                        adminRepository.save(admin);
                        passwordUpdated = true;
                    }
                }
            }

            if (!passwordVerified) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Current password is incorrect"));
            }

            if (passwordUpdated) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Password changed successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to update password"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Error: " + e.getMessage()));
        }
    }
}
// ===== END OF AUTH CONTROLLER =====
