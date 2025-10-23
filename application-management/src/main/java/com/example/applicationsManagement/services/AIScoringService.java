package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Application;
import com.example.applicationsManagement.entities.Candidate;
import com.example.applicationsManagement.entities.JobOffer;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 🤖 AI Scoring Service - Phase 3 (ML Enhanced)
 * 
 * Advanced algorithm for matching candidates to job offers based on:
 * - Skills matching with fuzzy logic + NLP extraction (Phase 2)
 * - Machine Learning predictions from historical data (Phase 3)
 * - Keyword relevance analysis
 * - Experience level estimation with NLP
 * - Resume completeness assessment
 * 
 * Combines Phase 2 (NLP) and Phase 3 (ML) for maximum accuracy
 * 
 * @author JobHub AI Team
 * @version 3.0 - ML Enhanced with hybrid scoring
 */
@Service
public class AIScoringService {
    
    private final NLPExtractionService nlpService;
    private final MLPredictionService mlService;
    
    // Constructor injection
    public AIScoringService(NLPExtractionService nlpService, MLPredictionService mlService) {
        this.nlpService = nlpService;
        this.mlService = mlService;
    }

    // Stop words to ignore in keyword analysis
    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
        "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
        "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has",
        "had", "do", "does", "did", "will", "would", "should", "could", "may", "might",
        "must", "can", "this", "that", "these", "those", "we", "you", "he", "she", "it"
    ));

    // Common skill aliases for better matching
    private static final Map<String, Set<String>> SKILL_ALIASES = new HashMap<>() {{
        put("javascript", new HashSet<>(Arrays.asList("js", "javascript", "ecmascript", "node.js", "nodejs")));
        put("python", new HashSet<>(Arrays.asList("python", "py", "python3")));
        put("java", new HashSet<>(Arrays.asList("java", "jdk", "java ee", "jakarta ee")));
        put("react", new HashSet<>(Arrays.asList("react", "reactjs", "react.js")));
        put("angular", new HashSet<>(Arrays.asList("angular", "angularjs", "angular.js")));
        put("spring", new HashSet<>(Arrays.asList("spring", "spring boot", "springboot")));
        put("sql", new HashSet<>(Arrays.asList("sql", "mysql", "postgresql", "oracle", "mssql")));
    }};

    /**
     * 🎯 Main method: Calculate AI match score for an application
     * 
     * @param application The application to score
     * @param candidate The candidate who applied
     * @param jobOffer The job offer being applied to
     * @return Map containing score (0-100) and detailed explanation
     */
    public Map<String, Object> calculateScore(Application application, Candidate candidate, JobOffer jobOffer) {
        try {
            System.out.println("\n========================================");
            System.out.println("🤖 AI SCORING ENGINE - Starting Analysis (Phase 3)");
            System.out.println("========================================");
            
            // Extract CV data using NLP (Phase 2)
            Map<String, Object> cvData = extractCVWithNLP(application.getResume());
            
            // Extract and normalize job data
            String jobSkills = normalizeText(jobOffer.getSkills());
            String jobDescription = normalizeText(jobOffer.getDescription());
            String jobTitle = normalizeText(jobOffer.getTitle());
            
            System.out.println("💼 Job Title: " + jobOffer.getTitle());
            System.out.println("🔧 Required Skills: " + jobSkills);
            
            // Calculate scoring components with NLP data (Phase 2)
            Map<String, Double> skillsResult = calculateSkillsMatchWithNLP(cvData, jobSkills);
            Map<String, Double> keywordResult = calculateKeywordMatchWithNLP(cvData, jobDescription, jobTitle);
            double experienceScore = calculateExperienceScoreWithNLP(cvData, jobDescription);
            double completenessScore = calculateCompletenessScore(application, candidate);
            
            // Weighted calculation (Phase 2 score)
            double skillsScore = skillsResult.get("score");
            double keywordScore = keywordResult.get("score");
            
            System.out.println("\n📊 Phase 2 (NLP) Component Scores:");
            System.out.println("   Skills Match: " + String.format("%.1f%%", skillsScore * 100));
            System.out.println("   Keyword Relevance: " + String.format("%.1f%%", keywordScore * 100));
            System.out.println("   Experience Level: " + String.format("%.1f%%", experienceScore * 100));
            System.out.println("   Profile Completeness: " + String.format("%.1f%%", completenessScore * 100));
            
            // Phase 2 weighted score (Skills: 40%, Keywords: 30%, Experience: 20%, Completeness: 10%)
            double phase2Score = (skillsScore * 0.40) + (keywordScore * 0.30) + 
                                (experienceScore * 0.20) + (completenessScore * 0.10);
            
            System.out.println("\n📈 Phase 2 (NLP) Score: " + String.format("%.1f%%", phase2Score * 100));
            
            // Get ML prediction (Phase 3)
            // Extract required experience from description if available
            int requiredExperience = extractRequiredExperience(jobDescription);
            
            Map<String, Object> jobData = mlService.prepareJobData(
                jobOffer.getTitle(),
                jobOffer.getSkills(),
                jobOffer.getDescription(),
                requiredExperience
            );
            
            Map<String, Object> mlPrediction = mlService.predictCandidate(cvData, jobData);
            
            double finalScore;
            String explanation;
            
            // Combine Phase 2 + Phase 3 if ML is available
            if (mlPrediction.get("ml_available") != Boolean.FALSE && mlService.isMLAvailable()) {
                Object mlScoreObj = mlPrediction.get("ml_score");
                double mlScore = mlScoreObj instanceof Number ? ((Number) mlScoreObj).doubleValue() / 100.0 : 0.5;
                String mlConfidence = (String) mlPrediction.get("confidence");
                
                System.out.println("\n🤖 Phase 3 (ML) Prediction:");
                System.out.println("   ML Score: " + String.format("%.1f%%", mlScore * 100));
                System.out.println("   Confidence: " + mlConfidence);
                
                // Hybrid score: Phase 2 (60%) + Phase 3 ML (40%)
                // Gives more weight to ML if confidence is high
                double mlWeight = mlConfidence.equals("high") ? 0.50 : (mlConfidence.equals("medium") ? 0.40 : 0.30);
                double nlpWeight = 1.0 - mlWeight;
                
                finalScore = (phase2Score * nlpWeight) + (mlScore * mlWeight);
                
                System.out.println("\n🎯 HYBRID SCORE (Phase 2 + Phase 3):");
                System.out.println("   NLP Weight: " + String.format("%.0f%%", nlpWeight * 100));
                System.out.println("   ML Weight: " + String.format("%.0f%%", mlWeight * 100));
                System.out.println("   Final Score: " + String.format("%.1f%%", finalScore * 100));
                
                explanation = generateEnhancedExplanation(
                    skillsScore, keywordScore, experienceScore, completenessScore,
                    skillsResult, keywordResult, jobSkills, mlPrediction
                );
            } else {
                // Use Phase 2 only if ML unavailable
                finalScore = phase2Score;
                System.out.println("\n🎯 FINAL SCORE (Phase 2 only): " + String.format("%.1f%%", finalScore * 100));
                
                explanation = generateDetailedExplanation(
                    skillsScore, keywordScore, experienceScore, completenessScore,
                    skillsResult, keywordResult, jobSkills
                );
            }
            
            System.out.println("💡 " + explanation);
            System.out.println("========================================\n");
            
            // Return result
            Map<String, Object> result = new HashMap<>();
            result.put("score", Math.round(finalScore * 100 * 100.0) / 100.0); // Round to 2 decimals
            result.put("explanation", explanation);
            result.put("ml_prediction", mlPrediction.get("prediction"));
            result.put("ml_confidence", mlPrediction.get("confidence"));
            
            return result;
            
        } catch (Exception e) {
            System.err.println("❌ Error in AI Scoring: " + e.getMessage());
            e.printStackTrace();
            
            // Return default score on error
            Map<String, Object> result = new HashMap<>();
            result.put("score", 50.0);
            result.put("explanation", "Automated scoring encountered an issue. Manual review recommended.");
            return result;
        }
    }
    
    /**
     * 🧠 Extract CV data using Python NLP service (Phase 2)
     */
    private Map<String, Object> extractCVWithNLP(String base64Resume) {
        if (base64Resume == null || base64Resume.trim().isEmpty()) {
            System.out.println("⚠️ No resume provided");
            return createEmptyCVData();
        }
        
        System.out.println("\n🔗 Phase 2: Calling Python NLP Service...");
        
        // Call Python NLP service
        Map<String, Object> nlpResult = nlpService.extractCVData(base64Resume, "pdf");
        
        // Check if NLP was successful
        if (nlpResult.containsKey("success") && Boolean.TRUE.equals(nlpResult.get("success"))) {
            System.out.println("✅ NLP extraction successful!");
            System.out.println("   Skills extracted: " + (nlpResult.get("skills") != null ? ((List<?>) nlpResult.get("skills")).size() : 0));
            System.out.println("   Experience: " + nlpResult.get("experience_years") + " years");
            return nlpResult;
        } else {
            System.out.println("⚠️ NLP unavailable - using Phase 1 fallback");
            return createFallbackCVData(base64Resume);
        }
    }
    
    /**
     * Create empty CV data structure
     */
    private Map<String, Object> createEmptyCVData() {
        Map<String, Object> data = new HashMap<>();
        data.put("skills", new ArrayList<>());
        data.put("experience_years", 0);
        data.put("raw_text", "");
        data.put("word_count", 0);
        return data;
    }
    
    /**
     * Create fallback CV data when NLP is unavailable (Phase 1 logic)
     */
    private Map<String, Object> createFallbackCVData(String base64Resume) {
        Map<String, Object> data = new HashMap<>();
        data.put("skills", new ArrayList<>());
        
        // Estimate experience from resume size (Phase 1 logic)
        int length = base64Resume.length();
        if (length > 100000) {
            data.put("experience_years", 5);
            data.put("raw_text", "comprehensive_resume");
        } else if (length > 50000) {
            data.put("experience_years", 3);
            data.put("raw_text", "standard_resume");
        } else {
            data.put("experience_years", 1);
            data.put("raw_text", "basic_resume");
        }
        
        data.put("word_count", 0);
        data.put("fallback", true);
        return data;
    }
    
    /**
     * 🔧 Calculate skills match using NLP extracted skills (Phase 2)
     */
    @SuppressWarnings("unchecked")
    private Map<String, Double> calculateSkillsMatchWithNLP(Map<String, Object> cvData, String requiredSkills) {
        Map<String, Double> result = new HashMap<>();
        
        if (requiredSkills == null || requiredSkills.trim().isEmpty()) {
            result.put("score", 0.70);
            result.put("matched", 0.0);
            result.put("total", 0.0);
            return result;
        }
        
        // Parse required skills from job offer
        List<String> jobSkillsList = parseSkills(requiredSkills);
        
        if (jobSkillsList.isEmpty()) {
            result.put("score", 0.70);
            result.put("matched", 0.0);
            result.put("total", 0.0);
            return result;
        }
        
        // Get skills extracted by NLP
        List<String> cvSkills = (List<String>) cvData.getOrDefault("skills", new ArrayList<>());
        
        // Match skills
        int matchedCount = 0;
        for (String requiredSkill : jobSkillsList) {
            if (cvSkills.contains(requiredSkill.toLowerCase())) {
                matchedCount++;
            } else {
                // Check aliases
                for (String cvSkill : cvSkills) {
                    if (areSkillsRelated(requiredSkill, cvSkill)) {
                        matchedCount++;
                        break;
                    }
                }
            }
        }
        
        double matchPercentage = (double) matchedCount / jobSkillsList.size();
        
        // Bonus: minimum score if resume exists
        if (!cvSkills.isEmpty() || cvData.containsKey("raw_text")) {
            matchPercentage = Math.max(matchPercentage, 0.30);
        }
        
        result.put("score", Math.min(matchPercentage, 1.0));
        result.put("matched", (double) matchedCount);
        result.put("total", (double) jobSkillsList.size());
        
        return result;
    }
    
    /**
     * Check if two skills are related (using aliases)
     */
    private boolean areSkillsRelated(String skill1, String skill2) {
        String s1 = skill1.toLowerCase();
        String s2 = skill2.toLowerCase();
        
        for (Set<String> aliases : SKILL_ALIASES.values()) {
            if (aliases.contains(s1) && aliases.contains(s2)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 📝 Calculate keyword match using NLP extracted text (Phase 2)
     */
    private Map<String, Double> calculateKeywordMatchWithNLP(Map<String, Object> cvData, String jobDescription, String jobTitle) {
        Map<String, Double> result = new HashMap<>();
        
        String rawText = (String) cvData.getOrDefault("raw_text", "");
        
        if ((jobDescription == null || jobDescription.isEmpty()) && (jobTitle == null || jobTitle.isEmpty())) {
            result.put("score", 0.60);
            result.put("matched", 0.0);
            result.put("total", 0.0);
            return result;
        }
        
        // Extract keywords from job
        Set<String> jobKeywords = extractKeywords(jobDescription + " " + jobTitle);
        
        if (jobKeywords.isEmpty()) {
            result.put("score", 0.60);
            result.put("matched", 0.0);
            result.put("total", 0.0);
            return result;
        }
        
        // Match keywords in CV text
        String cvTextLower = rawText.toLowerCase();
        int matchedCount = 0;
        
        for (String keyword : jobKeywords) {
            if (cvTextLower.contains(keyword.toLowerCase())) {
                matchedCount++;
            }
        }
        
        double matchPercentage = (double) matchedCount / jobKeywords.size();
        
        result.put("score", Math.min(matchPercentage, 1.0));
        result.put("matched", (double) matchedCount);
        result.put("total", (double) jobKeywords.size());
        
        return result;
    }
    
    /**
     * 💼 Calculate experience score using NLP extracted years (Phase 2)
     */
    private double calculateExperienceScoreWithNLP(Map<String, Object> cvData, String jobDescription) {
        // Get experience from NLP
        Object expObj = cvData.get("experience_years");
        int cvExperience = (expObj instanceof Integer) ? (Integer) expObj : 0;
        
        // Extract required experience from job description
        int requiredYears = extractExperienceYears(jobDescription);
        
        if (requiredYears == 0) {
            return cvExperience > 0 ? 0.75 : 0.50; // Give decent score if no requirement
        }
        
        // Calculate ratio
        double ratio = (double) cvExperience / requiredYears;
        
        if (ratio >= 1.0) {
            return 0.90; // Meets or exceeds requirement
        } else if (ratio >= 0.7) {
            return 0.70 + (ratio - 0.7) * 0.67; // 70-90%
        } else if (ratio >= 0.4) {
            return 0.50 + (ratio - 0.4) * 0.67; // 50-70%
        } else {
            return 0.30 + (ratio * 0.5); // 30-50%
        }
    }
    
    /**
     * 📄 Analyze resume content and extract metadata (Phase 1 - kept for backward compatibility)
     */
    private String analyzeResumeContent(String base64Resume) {
        if (base64Resume == null || base64Resume.trim().isEmpty()) {
            return "";
        }
        
        // For Phase 1: Check if resume exists and return metadata
        // In Phase 2: This will decode Base64 and extract actual text using Python NLP
        int length = base64Resume.length();
        
        if (length > 100000) {
            return "comprehensive_resume_detected"; // Large resume = detailed
        } else if (length > 50000) {
            return "standard_resume_detected";
        } else if (length > 10000) {
            return "basic_resume_detected";
        } else {
            return "minimal_resume_detected";
        }
    }
    
    /**
     * 🔧 Calculate skills matching with fuzzy logic and aliases
     */
    private Map<String, Double> calculateSkillsMatch(String resumeContent, String requiredSkills) {
        Map<String, Double> result = new HashMap<>();
        
        if (requiredSkills == null || requiredSkills.trim().isEmpty()) {
            result.put("score", 0.70); // Default score if no skills specified
            result.put("matched", 0.0);
            result.put("total", 0.0);
            return result;
        }
        
        // Parse required skills
        List<String> skillsList = parseSkills(requiredSkills);
        
        if (skillsList.isEmpty()) {
            result.put("score", 0.70);
            result.put("matched", 0.0);
            result.put("total", 0.0);
            return result;
        }
        
        // Count matches (Phase 1: probabilistic based on resume size)
        int totalSkills = skillsList.size();
        int matchedSkills = 0;
        
        for (String skill : skillsList) {
            // Check if skill or its aliases might be in resume
            if (isSkillLikelyPresent(resumeContent, skill)) {
                matchedSkills++;
            }
        }
        
        double matchPercentage = (double) matchedSkills / totalSkills;
        
        // Bonus: If resume exists, ensure minimum score
        if (!resumeContent.isEmpty()) {
            matchPercentage = Math.max(matchPercentage, 0.30); // Minimum 30% if resume provided
        }
        
        result.put("score", Math.min(matchPercentage, 1.0));
        result.put("matched", (double) matchedSkills);
        result.put("total", (double) totalSkills);
        
        return result;
    }
    
    /**
     * 🔍 Parse skills from comma/semicolon separated string
     */
    private List<String> parseSkills(String skillsString) {
        if (skillsString == null || skillsString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        return Arrays.stream(skillsString.split("[,;\\n]+"))
            .map(String::trim)
            .map(String::toLowerCase)
            .filter(s -> !s.isEmpty())
            .filter(s -> s.length() > 1) // Filter single characters
            .distinct()
            .collect(Collectors.toList());
    }
    
    /**
     * 🎲 Estimate if a skill is likely present in resume (Phase 1 heuristic)
     * In Phase 2, this will use actual NLP text analysis
     */
    private boolean isSkillLikelyPresent(String resumeContent, String skill) {
        if (resumeContent.isEmpty()) {
            return false;
        }
        
        // Phase 1: Probabilistic estimation based on resume quality
        double baseProbability = 0.0;
        
        if (resumeContent.equals("comprehensive_resume_detected")) {
            baseProbability = 0.70; // 70% chance for comprehensive resumes
        } else if (resumeContent.equals("standard_resume_detected")) {
            baseProbability = 0.55; // 55% chance for standard resumes
        } else if (resumeContent.equals("basic_resume_detected")) {
            baseProbability = 0.40; // 40% chance for basic resumes
        } else {
            baseProbability = 0.25; // 25% chance for minimal resumes
        }
        
        // Add some randomness for realistic variation
        double random = Math.random();
        return random < baseProbability;
    }
    
    /**
     * 📝 Calculate keyword relevance between resume and job description
     */
    private Map<String, Double> calculateKeywordMatch(String resumeContent, String jobDescription, String jobTitle) {
        Map<String, Double> result = new HashMap<>();
        
        if ((jobDescription == null || jobDescription.isEmpty()) && 
            (jobTitle == null || jobTitle.isEmpty())) {
            result.put("score", 0.60);
            result.put("matched", 0.0);
            result.put("total", 0.0);
            return result;
        }
        
        // Extract important keywords
        Set<String> importantKeywords = extractKeywords(jobDescription + " " + jobTitle);
        
        if (importantKeywords.isEmpty()) {
            result.put("score", 0.60);
            result.put("matched", 0.0);
            result.put("total", 0.0);
            return result;
        }
        
        // Count keyword matches (Phase 1: probabilistic)
        int totalKeywords = importantKeywords.size();
        int matchedKeywords = 0;
        
        for (String keyword : importantKeywords) {
            if (isKeywordLikelyPresent(resumeContent, keyword)) {
                matchedKeywords++;
            }
        }
        
        double matchPercentage = (double) matchedKeywords / totalKeywords;
        
        result.put("score", Math.min(matchPercentage, 1.0));
        result.put("matched", (double) matchedKeywords);
        result.put("total", (double) totalKeywords);
        
        return result;
    }
    
    /**
     * 🔤 Extract important keywords from text
     */
    private Set<String> extractKeywords(String text) {
        if (text == null || text.isEmpty()) {
            return new HashSet<>();
        }
        
        // Tokenize and filter
        return Arrays.stream(normalizeText(text).split("\\W+"))
            .map(String::toLowerCase)
            .filter(word -> word.length() > 3) // Min 4 characters
            .filter(word -> !STOP_WORDS.contains(word))
            .filter(word -> !word.matches("\\d+")) // Exclude pure numbers
            .limit(20) // Top 20 keywords
            .collect(Collectors.toSet());
    }
    
    /**
     * 🎲 Estimate if keyword is present (Phase 1 heuristic)
     */
    private boolean isKeywordLikelyPresent(String resumeContent, String keyword) {
        if (resumeContent.isEmpty()) {
            return false;
        }
        
        // Higher probability for comprehensive resumes
        double probability = resumeContent.equals("comprehensive_resume_detected") ? 0.60 :
                           resumeContent.equals("standard_resume_detected") ? 0.45 :
                           resumeContent.equals("basic_resume_detected") ? 0.30 : 0.20;
        
        return Math.random() < probability;
    }
    
    /**
     * 💼 Estimate experience level from resume and job requirements
     */
    private double calculateExperienceScore(String resumeContent, String jobDescription) {
        if (resumeContent.isEmpty()) {
            return 0.20; // Low score for no resume
        }
        
        // Extract experience requirements from job description
        int requiredYears = extractExperienceYears(jobDescription);
        
        // Estimate experience from resume quality
        double estimatedExperience = 0.0;
        
        if (resumeContent.equals("comprehensive_resume_detected")) {
            estimatedExperience = 5.0 + (Math.random() * 5); // 5-10 years
        } else if (resumeContent.equals("standard_resume_detected")) {
            estimatedExperience = 2.0 + (Math.random() * 4); // 2-6 years
        } else if (resumeContent.equals("basic_resume_detected")) {
            estimatedExperience = 0.5 + (Math.random() * 2); // 0.5-2.5 years
        } else {
            estimatedExperience = 0.0 + (Math.random() * 1); // 0-1 year
        }
        
        // Calculate match
        if (requiredYears == 0) {
            return 0.70; // No specific requirement, give decent score
        }
        
        double experienceRatio = estimatedExperience / requiredYears;
        
        if (experienceRatio >= 1.0) {
            return 0.85 + (Math.random() * 0.15); // 85-100%
        } else if (experienceRatio >= 0.7) {
            return 0.70 + (Math.random() * 0.15); // 70-85%
        } else if (experienceRatio >= 0.4) {
            return 0.50 + (Math.random() * 0.20); // 50-70%
        } else {
            return 0.30 + (Math.random() * 0.20); // 30-50%
        }
    }
    
    /**
     * 📅 Extract years of experience required from job description
     */
    private int extractExperienceYears(String jobDescription) {
        if (jobDescription == null || jobDescription.isEmpty()) {
            return 0;
        }
        
        // Look for patterns like "3 years", "5+ years", "3-5 years"
        Pattern pattern = Pattern.compile("(\\d+)\\+?\\s*(years?|yrs?|ans?)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(jobDescription);
        
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        
        return 0; // No specific requirement found
    }
    
    /**
     * ✅ Calculate profile completeness score
     */
    private double calculateCompletenessScore(Application application, Candidate candidate) {
        double score = 0.0;
        int maxPoints = 5;
        int points = 0;
        
        // Resume provided
        if (application.getResume() != null && !application.getResume().isEmpty()) {
            points++;
        }
        
        // Cover letter provided (bonus)
        if (application.getCoverLetter() != null && !application.getCoverLetter().isEmpty()) {
            points++;
        }
        
        // Candidate profile complete
        if (candidate.getPhone() != null) {
            points++;
        }
        
        if (candidate.getFirstname() != null && candidate.getLastname() != null) {
            points++;
        }
        
        if (candidate.getEmail() != null && !candidate.getEmail().isEmpty()) {
            points++;
        }
        
        score = (double) points / maxPoints;
        return Math.min(score, 1.0);
    }
    
    /**
     * 🎯 Generate enhanced explanation with ML insights (Phase 3)
     */
    private String generateEnhancedExplanation(
            double skillsScore, double keywordScore, double experienceScore, double completenessScore,
            Map<String, Double> skillsResult, Map<String, Double> keywordResult, String jobSkills,
            Map<String, Object> mlPrediction) {
        
        StringBuilder explanation = new StringBuilder();
        
        // ML Prediction insight
        String mlPred = (String) mlPrediction.get("prediction");
        String mlConf = (String) mlPrediction.get("confidence");
        Object mlScoreObj = mlPrediction.get("ml_score");
        double mlScore = mlScoreObj instanceof Number ? ((Number) mlScoreObj).doubleValue() : 50.0;
        
        if ("ACCEPTED".equals(mlPred) && mlScore >= 70) {
            explanation.append("🌟 ");
        } else if ("ACCEPTED".equals(mlPred)) {
            explanation.append("✅ ");
        } else if (mlScore >= 40 && mlScore < 60) {
            explanation.append("⚠️ ");
        } else {
            explanation.append("📋 ");
        }
        
        // Main assessment
        if (skillsScore >= 0.75) {
            explanation.append("Excellent match! ");
        } else if (skillsScore >= 0.60) {
            explanation.append("Strong candidate. ");
        } else if (skillsScore >= 0.40) {
            explanation.append("Moderate match. ");
        } else {
            explanation.append("Limited match. ");
        }
        
        // Skills detail
        double matched = skillsResult.get("matched");
        double total = skillsResult.get("total");
        if (total > 0) {
            explanation.append(String.format("Possesses %.0f/%.0f required skills (%.0f%%). ", 
                matched, total, skillsScore * 100));
        }
        
        // ML insight
        explanation.append(String.format("ML model predicts: %s (confidence: %s, %.0f%%). ",
            mlPred, mlConf, mlScore));
        
        // Additional insights
        if (experienceScore >= 0.8) {
            explanation.append("Experience level is well-suited. ");
        } else if (experienceScore >= 0.5) {
            explanation.append("Experience level is acceptable. ");
        }
        
        // Final recommendation
        if (mlScore >= 70 && skillsScore >= 0.6) {
            explanation.append("✨ Highly recommended for interview.");
        } else if (mlScore >= 60 || skillsScore >= 0.5) {
            explanation.append("📋 Consider for interview.");
        } else {
            explanation.append("May require further review.");
        }
        
        return explanation.toString();
    }
    
    /**
     * 💡 Generate detailed human-readable explanation
     */
    private String generateDetailedExplanation(
            double skillsScore, double keywordScore, double experienceScore, double completenessScore,
            Map<String, Double> skillsResult, Map<String, Double> keywordResult, String requiredSkills) {
        
        StringBuilder explanation = new StringBuilder();
        double avgScore = (skillsScore + keywordScore + experienceScore) / 3;
        
        // Overall assessment
        if (avgScore >= 0.75) {
            explanation.append("🌟 Excellent match! ");
        } else if (avgScore >= 0.60) {
            explanation.append("✅ Strong candidate. ");
        } else if (avgScore >= 0.45) {
            explanation.append("👍 Good potential. ");
        } else if (avgScore >= 0.30) {
            explanation.append("⚠️ Moderate match. ");
        } else {
            explanation.append("❗ Limited match. ");
        }
        
        // Skills analysis
        if (skillsResult.get("total") > 0) {
            int matched = skillsResult.get("matched").intValue();
            int total = skillsResult.get("total").intValue();
            
            if (skillsScore >= 0.70) {
                explanation.append(String.format("Possesses %d/%d required skills (%d%%). ", 
                    matched, total, (int)(skillsScore * 100)));
            } else if (skillsScore >= 0.40) {
                explanation.append(String.format("Has %d/%d skills, some gaps exist. ", matched, total));
            } else {
                explanation.append(String.format("Only %d/%d skills matched. ", matched, total));
            }
        }
        
        // Keyword relevance
        if (keywordScore >= 0.60) {
            explanation.append("Profile aligns well with job requirements. ");
        } else if (keywordScore >= 0.40) {
            explanation.append("Shows some relevant experience. ");
        } else {
            explanation.append("Limited alignment with job description. ");
        }
        
        // Experience assessment
        if (experienceScore >= 0.75) {
            explanation.append("Experience level is well-suited. ");
        } else if (experienceScore >= 0.50) {
            explanation.append("Experience level is acceptable. ");
        } else {
            explanation.append("May need training or mentoring. ");
        }
        
        // Completeness bonus
        if (completenessScore >= 0.80) {
            explanation.append("Complete professional profile. ");
        } else if (completenessScore < 0.60) {
            explanation.append("Profile could be more complete. ");
        }
        
        // Recommendation
        if (avgScore >= 0.65) {
            explanation.append("✨ Recommended for interview.");
        } else if (avgScore >= 0.45) {
            explanation.append("📋 Consider for shortlist.");
        } else {
            explanation.append("🔍 Further review needed.");
        }
        
        return explanation.toString();
    }
    
    /**
     * 🔤 Normalize text (lowercase, trim)
     */
    private String normalizeText(String text) {
        if (text == null) {
            return "";
        }
        return text.toLowerCase().trim();
    }
    
    /**
     * 📅 Extract required experience years from job description
     */
    private int extractRequiredExperience(String jobDescription) {
        if (jobDescription == null || jobDescription.isEmpty()) {
            return 0;
        }
        
        // Look for patterns like "5 years", "3+ years", "5-7 years"
        Pattern pattern = Pattern.compile("(\\d+)\\+?\\s*(?:years?|ans?)\\s*(?:of)?\\s*(?:experience)?", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(jobDescription);
        
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        
        return 0;
    }
}
