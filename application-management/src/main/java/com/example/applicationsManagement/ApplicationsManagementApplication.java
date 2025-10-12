package com.example.applicationsManagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableAspectJAutoProxy
@EnableScheduling
@SpringBootApplication(scanBasePackages = "com.example.applicationsManagement")
public class ApplicationsManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApplicationsManagementApplication.class, args);
    }
}
