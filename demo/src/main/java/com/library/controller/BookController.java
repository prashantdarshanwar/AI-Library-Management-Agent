package com.library.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.library.model.Book;
import com.library.service.BookService;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*") // Allows your Streamlit app to connect from any port
public class BookController {

    @Autowired
    private BookService service;

    // 📚 Basic Retrieval
    @GetMapping
    public List<Book> getAll() {
        return service.getAllBooks();
    }

    @GetMapping("/available")
    public List<Book> getAvailable() {
        return service.getAvailableBooks();
    }

    // 🤖 AI & Search
    @GetMapping("/chat")
    public List<Book> chat(@RequestParam String message) {
        return service.smartAgent(message);
    }

    @GetMapping("/recommend")
    public List<Book> recommend(@RequestParam String category) {
        // Updated to pass null as the excluded ID for general recommendations
        return service.recommendBooks(category, null); 
    }

    // 🔄 Transactional Actions (Issue & Return)
    @PostMapping("/{id}/issue")
    public ResponseEntity<?> issueBook(@PathVariable Integer id) {
        try {
            Book book = service.issueBook(id);
            return ResponseEntity.ok(book);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<?> returnBook(@PathVariable Integer id) {
        try {
            Book book = service.returnBook(id);
            return ResponseEntity.ok(book);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 🛠️ Management (CRUD)
    @PostMapping
    public Book add(@RequestBody Book book) {
        return service.addBook(book);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> update(@PathVariable Integer id, @RequestBody Book book) {
        try {
            return ResponseEntity.ok(service.updateBook(id, book));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        service.deleteBook(id);
        return ResponseEntity.ok("Book deleted successfully ✅");
    }
}