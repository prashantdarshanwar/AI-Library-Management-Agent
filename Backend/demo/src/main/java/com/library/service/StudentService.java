package com.library.service;

import com.library.model.Student;
import com.library.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Year;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repository;

    @Transactional
    public Student registerStudent(Student student) {
        // 1. Sanitize Email & Check for Duplicates
        if (student.getEmail() != null) {
            String sanitizedEmail = student.getEmail().toLowerCase().trim();
            if (repository.existsByEmail(sanitizedEmail)) {
                throw new RuntimeException("Error: Email '" + sanitizedEmail + "' is already registered!");
            }
            student.setEmail(sanitizedEmail);
        }

        // 2. Photo Handling Check
        // If the photo string is empty (""), set it to null so the database doesn't store empty strings
        if (student.getPhoto() != null && student.getPhoto().isBlank()) {
            student.setPhoto(null);
        }

        // 3. Generate the unique Library ID
        student.setLibraryId(generateLibraryId());
        
        // 4. Final Save
        return repository.save(student);
    }

    private String generateLibraryId() {
        Student lastStudent = repository.findTopByOrderByIdDesc();
        
        long nextNum = (lastStudent == null) ? 1 : lastStudent.getId() + 1;
        
        // Output example: LIB-2026-0001
        return String.format("LIB-%d-%04d", Year.now().getValue(), nextNum);
    }
}