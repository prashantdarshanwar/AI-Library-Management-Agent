package com.library.controller;

import com.library.model.Student;
import com.library.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
// Ensure this matches your Next.js dev server URL exactly
@CrossOrigin(origins = "http://localhost:3000") 
public class StudentController {

    @Autowired
    private StudentService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Student student) {
        try {
            // 1. Basic Server-side validation check
            if (student.getFullName() == null || student.getFullName().isEmpty()) {
                return ResponseEntity.badRequest().body("Student name is required.");
            }

            // 2. Log check for the photo (Optional, helps during debugging)
            if (student.getPhoto() != null) {
                System.out.println("Received photo payload for: " + student.getFullName());
            } else {
                System.out.println("Warning: Photo is null for: " + student.getFullName());
            }

            Student savedStudent = service.registerStudent(student);
            
            // 3. Return 201 Created for a new resource
            return new ResponseEntity<>(savedStudent, HttpStatus.CREATED);
            
        } catch (Exception e) {
            // 4. Handle unique constraint violations (like duplicate email)
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error: " + e.getMessage());
        }
    }
}