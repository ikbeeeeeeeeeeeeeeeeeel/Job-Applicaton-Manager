package com.example.applicationsManagement.scheduled;

import com.example.applicationsManagement.entities.JobOffer;
import com.example.applicationsManagement.repositories.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * Scheduled task to automatically close job offers that have passed their deadline
 */
@Component
@RequiredArgsConstructor
public class JobOfferScheduler {

    private static final Logger logger = LoggerFactory.getLogger(JobOfferScheduler.class);
    private final JobOfferRepository jobOfferRepository;

    /**
     * Runs every day at midnight to check and close expired job offers
     * Cron expression: "0 0 0 * * ?" = Every day at 00:00:00
     * For testing, you can change to: fixedRate = 60000 (every minute)
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void closeExpiredJobOffers() {
        Date now = new Date();
        
        // Get only expired job offers using efficient query
        List<JobOffer> expiredOffers = jobOfferRepository.findExpiredJobOffers(now);
        
        if (expiredOffers.isEmpty()) {
            logger.debug("No expired job offers to close");
            return;
        }
        
        // Close all expired offers
        for (JobOffer offer : expiredOffers) {
            offer.setStatus("CLOSED");
            jobOfferRepository.save(offer);
            
            logger.info("Auto-closed job offer ID: {} - Title: '{}' (Deadline: {})", 
                offer.getId(), offer.getTitle(), offer.getDeadline());
        }
        
        logger.info("✅ Successfully auto-closed {} expired job offer(s)", expiredOffers.size());
    }
}
