package com.example.applicationsManagement.services;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;

/**
 * 🎓 ML Training Service
 * 
 * Manages ML model training and lifecycle:
 * - Train model with synthetic data
 * - Check model status
 * - Get model information
 * - Auto-train on startup if no model exists
 * 
 * @author Backend Team
 * @version 1.0
 */
@Service
public class MLTrainingService {
    
    private final RestTemplate restTemplate;
    private final String ML_SERVICE_URL = "http://localhost:5001";
    private boolean mlServiceAvailable = false;
    
    public MLTrainingService() {
        // Configure RestTemplate with longer timeouts for training
        this.restTemplate = new RestTemplateBuilder()
            .setConnectTimeout(Duration.ofSeconds(10))
            .setReadTimeout(Duration.ofSeconds(60)) // Training can take time
            .build();
    }
    
    /**
     * Check ML service health on startup and auto-train if needed
     */
    @PostConstruct
    public void initializeMLModel() {
        System.out.println("\n========================================");
        System.out.println("🤖 ML Service Initialization");
        System.out.println("========================================");
        
        // Check if ML service is running
        if (checkMLServiceHealth()) {
            mlServiceAvailable = true;
            System.out.println("✅ ML Service is online");
            
            // Check if model exists
            Map<String, Object> modelInfo = getModelInfo();
            boolean modelExists = modelInfo != null && 
                                 Boolean.TRUE.equals(modelInfo.get("model_loaded"));
            
            if (modelExists) {
                System.out.println("✅ ML Model already trained and loaded");
                System.out.println("   Accuracy: " + modelInfo.get("accuracy"));
            } else {
                System.out.println("ℹ️  No trained model found");
                System.out.println("🚀 Auto-training ML model with synthetic data...");
                
                // Auto-train on startup
                Map<String, Object> trainingResult = trainModel(100, 0.2);
                if (trainingResult != null && Boolean.TRUE.equals(trainingResult.get("success"))) {
                    System.out.println("✅ ML Model trained successfully on startup!");
                    System.out.println("   Accuracy: " + trainingResult.get("accuracy"));
                } else {
                    System.out.println("⚠️  Auto-training failed - model can be trained manually via admin panel");
                }
            }
        } else {
            mlServiceAvailable = false;
            System.out.println("❌ ML Service is offline");
            System.out.println("   Start ML service with: python ml_app.py");
        }
        
        System.out.println("========================================\n");
    }
    
    /**
     * Check if ML service is available
     */
    private boolean checkMLServiceHealth() {
        try {
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.getForEntity(
                ML_SERVICE_URL + "/",
                Map.class
            );
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 🎓 Train ML model
     * 
     * @param trainingSize Number of synthetic examples to generate
     * @param testSize Proportion of data for testing (0.0 to 1.0)
     * @return Training results including accuracy, f1_score, etc.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> trainModel(int trainingSize, double testSize) {
        if (!mlServiceAvailable && !checkMLServiceHealth()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "ML Service is not available");
            return error;
        }
        
        try {
            System.out.println("\n🎓 Training ML Model...");
            System.out.println("   Training size: " + trainingSize);
            System.out.println("   Test size: " + (testSize * 100) + "%");
            
            // Prepare request
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("training_size", trainingSize);
            requestBody.put("test_size", testSize);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Call training API
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(
                ML_SERVICE_URL + "/api/train",
                entity,
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                
                if (Boolean.TRUE.equals(result.get("success"))) {
                    System.out.println("✅ ML Model trained successfully!");
                    System.out.println("   Accuracy: " + result.get("accuracy"));
                    System.out.println("   F1 Score: " + result.get("f1_score"));
                    System.out.println("   Training samples: " + result.get("training_samples"));
                    System.out.println("   Test samples: " + result.get("test_samples"));
                    mlServiceAvailable = true;
                    return result;
                } else {
                    System.out.println("❌ Training failed: " + result.get("error"));
                    return result;
                }
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "ML Service returned non-success status");
                return error;
            }
            
        } catch (Exception e) {
            System.out.println("❌ Error training ML model: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return error;
        }
    }
    
    /**
     * 📊 Get ML model information
     * 
     * @return Model info including loaded status, accuracy, etc.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getModelInfo() {
        if (!mlServiceAvailable && !checkMLServiceHealth()) {
            Map<String, Object> info = new HashMap<>();
            info.put("model_loaded", false);
            info.put("ml_service_available", false);
            info.put("message", "ML Service is not available");
            return info;
        }
        
        try {
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.getForEntity(
                ML_SERVICE_URL + "/api/model-info",
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> info = response.getBody();
                info.put("ml_service_available", true);
                return info;
            } else {
                Map<String, Object> info = new HashMap<>();
                info.put("model_loaded", false);
                info.put("ml_service_available", true);
                info.put("message", "Could not retrieve model info");
                return info;
            }
            
        } catch (Exception e) {
            Map<String, Object> info = new HashMap<>();
            info.put("model_loaded", false);
            info.put("ml_service_available", false);
            info.put("error", e.getMessage());
            return info;
        }
    }
    
    /**
     * Check if ML service is currently available
     */
    public boolean isMLServiceAvailable() {
        if (!mlServiceAvailable) {
            mlServiceAvailable = checkMLServiceHealth();
        }
        return mlServiceAvailable;
    }
}