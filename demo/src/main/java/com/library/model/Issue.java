package com.library.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "issue")
public class Issue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private String studentId; // ✅ MUST BE STRING

    @Column(name = "book_id")
    private Long bookId;

    private String status;
    private LocalDate issueDate;
    private LocalDate returnDate;
    private String librarianId;
}