package com.example.applicationsManagement.services;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;

/**
 * 🤖 ML Prediction Service (Phase 3)
 * 
 * Communicates with Python ML microservice to get machine learning predictions.
 * 
 * Features:
 * - Sends CV + Job data to ML service
 * - Receives ML prediction (ACCEPTED/REJECTED)
 * - Gets confidence scores
 * - Handles errors gracefully
 * - Falls back to Phase 2 (NLP) if ML unavailable
 * 
 * @author Phase 3 Team
 * @version 1.0
 */
@Service
public class MLPredictionService {
    
    private final RestTemplate restTemplate;
    private final String ML_API_URL = "http://localhost:5001/api/predict";
    private boolean mlServiceAvailable = true;
    
    public MLPredictionService() {
        // Configure RestTemplate with timeouts
        this.restTemplate = new RestTemplateBuilder()
            .setConnectTimeout(Duration.ofSeconds(10))
            .setReadTimeout(Duration.ofSeconds(30))
            .build();
        checkMLServiceHealth();
    }
    
    /**
     * Check if Python ML service is available
     */
    private void checkMLServiceHealth() {
        try {
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.getForEntity(
                "http://localhost:5001/",
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                mlServiceAvailable = true;
                System.out.println("✅ Python ML service is online (Phase 3)");
            }
        } catch (Exception e) {
            mlServiceAvailable = false;
            System.out.println("ℹ️ Python ML service is offline - will use Phase 2 (NLP only)");
        }
    }
    
    /**
     * 🔮 Get ML prediction for candidate
     * 
     * @param cvData CV data extracted by NLP
     * @param jobData Job offer data
     * @return Map containing ML prediction, score, and confidence
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> predictCandidate(Map<String, Object> cvData, Map<String, Object> jobData) {
        // Check if ML service is available
        if (!mlServiceAvailable) {
            System.out.println("ℹ️ ML service unavailable - skipping ML prediction");
            return createFallbackResponse();
        }
        
        try {
            System.out.println("\n🤖 Calling ML Prediction Service (Phase 3)...");
            System.out.println("   URL: " + ML_API_URL);
            
            // Prepare request
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("cv_data", cvData);
            requestBody.put("job_data", jobData);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Call ML API
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                ML_API_URL,
                entity,
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                
                if (Boolean.TRUE.equals(result.get("success"))) {
                    String prediction = (String) result.get("prediction");
                    Object mlScoreObj = result.get("ml_score");
                    double mlScore = mlScoreObj instanceof Number ? ((Number) mlScoreObj).doubleValue() : 50.0;
                    String confidence = (String) result.get("confidence");
                    
                    System.out.println("✅ ML prediction successful!");
                    System.out.println("   Prediction: " + prediction);
                    System.out.println("   ML Score: " + mlScore + "%");
                    System.out.println("   Confidence: " + confidence);
                    
                    return result;
                } else {
                    System.out.println("⚠️ ML service returned error: " + result.get("error"));
                    return createFallbackResponse();
                }
            } else {
                System.out.println("⚠️ ML service returned non-success status");
                return createFallbackResponse();
            }
            
        } catch (org.springframework.web.client.ResourceAccessException e) {
            System.out.println("❌ ML service not reachable: " + e.getMessage());
            System.out.println("   Make sure ML service is running on port 5001");
            mlServiceAvailable = false;
            return createFallbackResponse();
            
        } catch (Exception e) {
            System.out.println("❌ Error calling ML service: " + e.getMessage());
            e.printStackTrace();
            return createFallbackResponse();
        }
    }
    
    /**
     * Create fallback response when ML is unavailable
     */
    private Map<String, Object> createFallbackResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("prediction", "UNKNOWN");
        response.put("ml_score", 50.0);
        response.put("confidence", "low");
        response.put("ml_available", false);
        return response;
    }
    
    /**
     * Check if ML service is currently available
     */
    public boolean isMLAvailable() {
        return mlServiceAvailable;
    }
    
    /**
     * Prepare job data for ML prediction
     */
    public Map<String, Object> prepareJobData(String title, String requiredSkills, String description, int experienceLevel) {
        Map<String, Object> jobData = new HashMap<>();
        jobData.put("title", title != null ? title : "");
        jobData.put("required_skills", requiredSkills != null ? requiredSkills : "");
        jobData.put("description", description != null ? description : "");
        jobData.put("required_experience", experienceLevel);
        return jobData;
    }
}
