package com.library.service;

import com.library.model.Book;
import com.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository repo;

    public List<Book> getAllBooks() {
        return repo.findAll();
    }

    public List<Book> searchBooks(String keyword) {
        return repo.findByTitleContainingOrAuthorContaining(keyword, keyword);
    }

    @Transactional
    public Book addBook(Book book) {
        if (book.getTotalQuantity() == null || book.getTotalQuantity() < 1) {
            book.setTotalQuantity(1);
        }
        book.setCurrentStock(book.getTotalQuantity());
        // Logic: Available if stock > 0
        book.setAvailable(book.getCurrentStock() > 0); 
        return repo.save(book);
    }

    // 🔥 NEW: Modern Issue Logic (Decrements stock)
    @Transactional
    public Book issueBook(Integer id) {
        Book book = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found ❌"));

        if (book.getCurrentStock() > 0) {
            book.setCurrentStock(book.getCurrentStock() - 1);
            // ONLY set false if it was the last copy
            book.setAvailable(book.getCurrentStock() > 0);
            return repo.save(book);
        } else {
            throw new RuntimeException("Out of stock! Cannot issue 🚫");
        }
    }

    // 🔥 NEW: Modern Return Logic (Increments stock)
    @Transactional
    public Book returnBook(Integer id) {
        Book book = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found ❌"));

        if (book.getCurrentStock() < book.getTotalQuantity()) {
            book.setCurrentStock(book.getCurrentStock() + 1);
            // Always becomes true because we just added one back
            book.setAvailable(true);
            return repo.save(book);
        }
        return book;
    }

    @Transactional
    public Book updateBook(Integer id, Book book) {
        Book existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found ❌"));

        existing.setTitle(book.getTitle());
        existing.setAuthor(book.getAuthor());
        existing.setCategory(book.getCategory());
        existing.setLocation(book.getLocation());
        
        if (book.getTotalQuantity() != null) {
            int diff = book.getTotalQuantity() - existing.getTotalQuantity();
            existing.setTotalQuantity(book.getTotalQuantity());
            // This preserves how many are currently "out"
            existing.setCurrentStock(existing.getCurrentStock() + diff);
        }

        existing.setAvailable(existing.getCurrentStock() > 0);
        return repo.save(existing);
    }

    @Transactional
    public void deleteBook(Integer id) {
        repo.deleteById(id);
    }

    public List<Book> recommendBooks(String category) {
        return repo.findAll().stream()
                .filter(b -> b.getCategory().equalsIgnoreCase(category) && b.getCurrentStock() > 0)
                .toList();
    }

    public List<Book> getAvailableBooks() {
        return repo.findAll().stream()
                .filter(b -> b.getCurrentStock() > 0)
                .toList();
    }

    public List<Book> getIssuedBooks() {
        return repo.findAll().stream()
                .filter(b -> b.getCurrentStock() < b.getTotalQuantity())
                .toList();
    }

    public List<Book> smartAgent(String query) {
        String q = query.toLowerCase();
        List<Book> allBooks = repo.findAll();

        if (q.contains("available") || q.contains("free") || q.contains("in stock")) {
            return allBooks.stream().filter(b -> b.getCurrentStock() > 0).toList();
        }

        if (q.contains("issued") || q.contains("taken") || q.contains("empty")) {
            return allBooks.stream().filter(b -> b.getCurrentStock() < b.getTotalQuantity()).toList();
        }

        String[] words = q.split(" ");
        return allBooks.stream()
                .filter(b -> {
                    for (String word : words) {
                        if (b.getTitle().toLowerCase().contains(word) || 
                            b.getAuthor().toLowerCase().contains(word) || 
                            b.getCategory().toLowerCase().contains(word) ||
                            (b.getLocation() != null && b.getLocation().toLowerCase().contains(word))) {
                            return true;
                        }
                    }
                    return false;
                })
                .toList();
    }

    public List<Book> getBooksByLocation(String location) {
        return repo.findAll().stream()
                .filter(b -> b.getLocation() != null && 
                        b.getLocation().toLowerCase().contains(location.toLowerCase()))
                .toList();
    }
}