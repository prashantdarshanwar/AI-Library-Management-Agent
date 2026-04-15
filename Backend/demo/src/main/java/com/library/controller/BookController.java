package com.library.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.library.model.Book;
import com.library.service.BookService;

@RestController
@RequestMapping("/api/books")
@CrossOrigin
public class BookController {

    @Autowired
    private BookService service;

    // 📚 Get all books
    @GetMapping
    public List<Book> getAll() {
        return service.getAllBooks();
    }

    // 🔍 Smart search (title + author)
    @GetMapping("/search")
    public List<Book> search(@RequestParam String keyword) {
        return service.searchBooks(keyword);
    }

    // 🔥 NEW: Search by LOCATION (Rack)
    @GetMapping("/location")
    public List<Book> getByLocation(@RequestParam String location) {
        return service.getBooksByLocation(location);
    }

    // 🤖 Recommendation API
    @GetMapping("/recommend")
    public List<Book> recommend(@RequestParam String category) {
        return service.recommendBooks(category);
    }

    // ➕ UPDATED: Add new book (Quantity logic moved to Service)
    @PostMapping
    public Book add(@RequestBody Book book) {
        // We removed the manual setAvailable(true) here.
        // The service now handles currentStock and availability automatically.
        return service.addBook(book);
    }

    // ✏️ UPDATE book
    @PutMapping("/{id}")
    public Book update(@PathVariable Integer id, @RequestBody Book book) {
        return service.updateBook(id, book);
    }

    // ❌ DELETE book
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id) {
        service.deleteBook(id);
        return "Book deleted successfully";
    }

    // 🔥 NEW: Get only available books
    @GetMapping("/available")
    public List<Book> getAvailableBooks() {
        return service.getAvailableBooks();
    }

    // 🔥 NEW: Get only issued books
    @GetMapping("/issued")
    public List<Book> getIssuedBooks() {
        return service.getIssuedBooks();
    }

    // 🤖 AI Chat Agent (Now Un-commented and active)
    @GetMapping("/chat")
    public List<Book> chat(@RequestParam String message) {
        return service.smartAgent(message);
    }
}