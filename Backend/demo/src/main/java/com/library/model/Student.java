package com.library.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "students")
@Data
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Explicitly map to library_id to match your screenshot
    @Column(name = "library_id", unique = true, nullable = false)
    private String libraryId; 

    // ✅ Explicitly map to full_name to match your screenshot
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    // ✅ Explicitly map to phone_number
    @Column(name = "phone_number")
    private String phoneNumber;

    private String department;

    // ✅ Explicitly map to membership_plan
    @Column(name = "membership_plan")
    private String membershipPlan;

    /**
     * RENAMED to 'photo' to match the frontend payload.
     * LONGTEXT handles the large Base64 string seen in your screenshot.
     */
    @Lob 
    @Column(name = "photo", columnDefinition = "LONGTEXT")
    private String photo;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @PrePersist
    protected void onCreate() {
        if (this.registrationDate == null) {
            this.registrationDate = LocalDate.now();
        }
    }
}