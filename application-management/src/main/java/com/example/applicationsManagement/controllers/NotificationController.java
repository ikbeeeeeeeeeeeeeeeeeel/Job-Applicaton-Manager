package com.example.applicationsManagement.controllers;

import com.example.applicationsManagement.entities.Notification;
import com.example.applicationsManagement.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For frontend access
public class NotificationController {

    private final NotificationService notificationService;

    /**
     Send a new notification
     */
    @PostMapping
    public Notification sendNotification(@RequestBody Notification notification) {
        return notificationService.sendNotification(notification);
    }
}

