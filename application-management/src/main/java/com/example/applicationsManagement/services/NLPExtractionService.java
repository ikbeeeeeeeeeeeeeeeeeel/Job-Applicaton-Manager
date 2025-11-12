package com.example.applicationsManagement.services;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;

/**
 * 🔗 NLP Extraction Service
 * 
 * Communicates with Python Flask microservice to extract CV data using NLP.
 * 
 * Features:
 * - Sends Base64 CV to Python API
 * - Receives extracted skills, experience, education
 * - Handles errors gracefully
 * - Falls back to Phase 1 if Python unavailable
 * 
 * @author Phase 2 Team
 * @version 1.0
 */
@Service
public class NLPExtractionService {
    
    private final RestTemplate restTemplate;
    private final String PYTHON_API_URL = "http://localhost:5000/api/extract-cv-data";
    private boolean pythonServiceAvailable = true;
    
    public NLPExtractionService() {
        // Configure RestTemplate with timeouts
        this.restTemplate = new RestTemplateBuilder()
            .setConnectTimeout(Duration.ofSeconds(10))
            .setReadTimeout(Duration.ofSeconds(30))
            .build();
        checkPythonServiceHealth();
    }
    
    /**
     * Check if Python NLP service is available
     */
    private void checkPythonServiceHealth() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                "http://localhost:5000/",
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                pythonServiceAvailable = true;
                System.out.println("✅ Python NLP service is online");
            }
        } catch (Exception e) {
            pythonServiceAvailable = false;
            System.out.println("⚠️ Python NLP service is offline");
        }
    }
    
    /**
     * 🧠 Extract CV data using Python NLP service
     * 
     * @param base64Resume Base64 encoded CV
     * @param fileType "pdf" or "docx"
     * @return Map containing extracted data (skills, experience, education)
     */
    public Map<String, Object> extractCVData(String base64Resume, String fileType) {
        // Check if Python service is available
        if (!pythonServiceAvailable) {
            System.out.println("⚠️ Python service unavailable - using fallback");
            return createFallbackResponse();
        }
        
        try {
            System.out.println("\n🔗 Calling Python NLP Service...");
            System.out.println("   URL: " + PYTHON_API_URL);
            System.out.println("   File Type: " + fileType);
            System.out.println("   Resume Size: " + base64Resume.length() + " chars");
            
            // Prepare request
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("resume", base64Resume);
            requestBody.put("fileType", fileType != null ? fileType : "pdf");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);
            
            // Call Python API (timeouts already configured in constructor)
            ResponseEntity<Map> response = restTemplate.postForEntity(
                PYTHON_API_URL,
                entity,
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                
                if (Boolean.TRUE.equals(result.get("success"))) {
                    System.out.println("✅ NLP extraction successful!");
                    System.out.println("   Skills found: " + 
                        (result.get("skills") != null ? ((List<?>) result.get("skills")).size() : 0));
                    System.out.println("   Experience: " + result.get("experience_years") + " years");
                    System.out.println("   Education: " + 
                        (result.get("education") != null ? ((List<?>) result.get("education")).size() : 0) + " entries");
                    
                    return result;
                } else {
                    System.out.println("⚠️ NLP service returned error: " + result.get("error"));
                    return createFallbackResponse();
                }
            } else {
                System.out.println("⚠️ NLP service returned non-success status");
                return createFallbackResponse();
            }
            
        } catch (org.springframework.web.client.ResourceAccessException e) {
            System.err.println("❌ Python NLP service not reachable: " + e.getMessage());
            System.err.println("   Make sure Python service is running on port 5000");
            pythonServiceAvailable = false;
            return createFallbackResponse();
            
        } catch (Exception e) {
            System.err.println("❌ Error calling NLP service: " + e.getMessage());
            e.printStackTrace();
            return createFallbackResponse();
        }
    }
    
    /**
     * Create fallback response when Python service is unavailable
     * Uses Phase 1 logic (basic estimation)
     */
    private Map<String, Object> createFallbackResponse() {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("success", false);
        fallback.put("skills", new ArrayList<>());
        fallback.put("experience_years", 0);
        fallback.put("education", new ArrayList<>());
        fallback.put("raw_text", "");
        fallback.put("fallback", true);
        fallback.put("message", "Using Phase 1 estimation (Python NLP unavailable)");
        return fallback;
    }
    
    /**
     * Check if Python service is currently available
     */
    public boolean isPythonServiceAvailable() {
        return pythonServiceAvailable;
    }
    
    /**
     * Manually set Python service availability (for testing)
     */
    public void setPythonServiceAvailable(boolean available) {
        this.pythonServiceAvailable = available;
    }
    
    /**
     * Retry connection to Python service
     */
    public void retryConnection() {
        checkPythonServiceHealth();
    }
}