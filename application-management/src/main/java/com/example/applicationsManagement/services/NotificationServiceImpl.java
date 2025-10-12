package com.example.applicationsManagement.services;

import com.example.applicationsManagement.entities.Notification;
import com.example.applicationsManagement.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    @Override
    public Notification sendNotification(Notification notification) {
        notification.setSendingDate(new java.util.Date());
        notification.setStatus("Sent");
        return notificationRepository.save(notification);
    }
}

