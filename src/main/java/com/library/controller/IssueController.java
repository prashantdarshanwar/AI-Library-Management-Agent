package com.library.controller;

import com.library.model.Book;
import com.library.model.Issue;
import com.library.model.Student;
import com.library.repository.BookRepository;
import com.library.repository.IssueRepository;
import com.library.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/issue")
@CrossOrigin
public class IssueController {

    @Autowired
    private IssueRepository issueRepo;

    @Autowired
    private BookRepository bookRepo;

    @Autowired
    private StudentRepository studentRepo;

    /**
     * ✅ FIXED: Student Verification Endpoint
     * Resolves the type mismatch by using .orElseGet()
     */
    @GetMapping("/verify/{libraryId}")
public ResponseEntity<?> verifyStudent(@PathVariable String libraryId) {
    var student = studentRepo.findByLibraryId(libraryId);
    
    if (student.isPresent()) {
        return ResponseEntity.ok(student.get());
    } else {
        return ResponseEntity.status(404).body("Library ID " + libraryId + " not found ❌");
    }
}
    /**
     * ✅ UPDATED: Issue Book Logic
     * Added extra safety checks for Student and Book status
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> issueBook(@RequestBody Issue issue) {
        try {
            // 🔍 DEBUG LINE: Check your console/terminal for this output
            System.out.println("DEBUG: Request to issue to Library ID: '" + issue.getStudentId() + "'");

            // 1. Verify Student exists using library_id from the payload
            if (issue.getStudentId() == null || !studentRepo.existsByLibraryId(issue.getStudentId().trim())) {
                return ResponseEntity.badRequest().body("Transaction Aborted: Invalid Library ID [" + issue.getStudentId() + "] ❌");
            }

            // 2. Fetch Book and validate stock
            Integer bookId = issue.getBookId().intValue();
            Book book = bookRepo.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("Book record missing for ID: " + bookId));

            if (book.getCurrentStock() == null || book.getCurrentStock() <= 0) {
                return ResponseEntity.badRequest().body("Error: '" + book.getTitle() + "' is out of stock ❌");
            }

            // 3. Update Inventory
            book.setCurrentStock(book.getCurrentStock() - 1);
            book.setAvailable(book.getCurrentStock() > 0);
            bookRepo.save(book);

            // 4. Finalize Issue Record
            issue.setIssueDate(LocalDate.now());
            issue.setStatus("ISSUED");
            
            Issue savedIssue = issueRepo.save(issue);
            return ResponseEntity.ok(savedIssue);
            
        } catch (Exception e) {
            e.printStackTrace(); // 🔍 Print full error stack to console
            return ResponseEntity.internalServerError().body("System Error: " + e.getMessage());
        }
    }

    /**
     * ✅ UPDATED: Return Book Logic
     * Ensures stock is replenished correctly
     */
    @PutMapping("/return/{id}")
    @Transactional
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            Issue issue = issueRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Issue record " + id + " not found ❌"));

            if ("RETURNED".equals(issue.getStatus())) {
                return ResponseEntity.badRequest().body("Notice: This book was already returned.");
            }

            // Update Issue status
            issue.setReturnDate(LocalDate.now());
            issue.setStatus("RETURNED");

            // Update Book stock
            Integer bookId = issue.getBookId().intValue();
            Book book = bookRepo.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("Original book data is missing ❌"));

            book.setCurrentStock((book.getCurrentStock() == null ? 0 : book.getCurrentStock()) + 1);
            book.setAvailable(true);
            bookRepo.save(book);

            Issue updatedIssue = issueRepo.save(issue);
            return ResponseEntity.ok(updatedIssue);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing return: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Issue> getAll() {
        return issueRepo.findAll();
    }
}