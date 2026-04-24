package com.library.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.library.model.Book;
import com.library.service.BookService;

@RestController
@RequestMapping("/api/books")
/* Note: We removed @CrossOrigin here because you are using a global CorsConfig.java. 
   If you don't have a global config, use @CrossOrigin(origins = "*") for development.
*/
public class BookController {

    @Autowired
    private BookService service;

    // 📚 Get all books
    @GetMapping
    public ResponseEntity<List<Book>> getAll() {
        return ResponseEntity.ok(service.getAllBooks());
    }

    // 🔍 Smart search (matches Streamlit: params={"keyword": prompt})
    @GetMapping("/search")
    public ResponseEntity<List<Book>> search(@RequestParam String keyword) {
        List<Book> results = service.searchBooks(keyword);
        return ResponseEntity.ok(results);
    }

    // 📍 Search by LOCATION (Rack/Floor)
    @GetMapping("/location")
    public ResponseEntity<List<Book>> getByLocation(@RequestParam String location) {
        return ResponseEntity.ok(service.getBooksByLocation(location));
    }

    // 🤖 Recommendation API
    @GetMapping("/recommend")
    public ResponseEntity<List<Book>> recommend(@RequestParam String category) {
        return ResponseEntity.ok(service.recommendBooks(category));
    }

    // ➕ Add new book
    @PostMapping
    public ResponseEntity<Book> add(@RequestBody Book book) {
        return ResponseEntity.status(201).body(service.addBook(book));
    }

    // ✏️ Update book
    @PutMapping("/{id}")
    public ResponseEntity<Book> update(@PathVariable Integer id, @RequestBody Book book) {
        Book updated = service.updateBook(id, book);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // ❌ Delete book
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        service.deleteBook(id);
        return ResponseEntity.ok("Book deleted successfully");
    }

    // ✅ Get only available books
    @GetMapping("/available")
    public ResponseEntity<List<Book>> getAvailableBooks() {
        return ResponseEntity.ok(service.getAvailableBooks());
    }

    // 📦 Get only issued books
    @GetMapping("/issued")
    public ResponseEntity<List<Book>> getIssuedBooks() {
        return ResponseEntity.ok(service.getIssuedBooks());
    }

    // 🤖 AI Chat Agent (Matches Streamlit: params={"message": prompt})
    @GetMapping("/chat")
    public ResponseEntity<List<Book>> chat(@RequestParam String message) {
        List<Book> aiResults = service.smartAgent(message);
        return ResponseEntity.ok(aiResults);
    }
}