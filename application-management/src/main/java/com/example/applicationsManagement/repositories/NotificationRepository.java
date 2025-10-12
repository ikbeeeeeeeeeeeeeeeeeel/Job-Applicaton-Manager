package com.example.applicationsManagement.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.applicationsManagement.entities.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
