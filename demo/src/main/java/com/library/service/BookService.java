package com.library.service;

import com.library.model.Book;
import com.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
        book.setAvailable(book.getCurrentStock() > 0); 
        return repo.save(book);
    }

    @Transactional
    public Book issueBook(Integer id) {
        Book book = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found ❌"));

        if (book.getCurrentStock() > 0) {
            book.setCurrentStock(book.getCurrentStock() - 1);
            book.setAvailable(book.getCurrentStock() > 0);
            return repo.save(book);
        } else {
            throw new RuntimeException("Out of stock! Cannot issue 🚫");
        }
    }

    @Transactional
    public Book returnBook(Integer id) {
        Book book = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found ❌"));

        if (book.getCurrentStock() < book.getTotalQuantity()) {
            book.setCurrentStock(book.getCurrentStock() + 1);
            book.setAvailable(true);
            return repo.save(book);
        }
        return book;
    }

    // --- AI & RECOMMENDATION LOGIC ---

    /**
     * Finds similar books in the same category.
     * Excludes the current book ID to avoid recommending the one already being viewed.
     */
    public List<Book> recommendBooks(String category, Integer excludeId) {
        return repo.findAll().stream()
                .filter(b -> b.getCategory().equalsIgnoreCase(category) 
                        && !b.getId().equals(excludeId)
                        && b.getCurrentStock() > 0)
                .limit(3) // Limit to top 3 for a clean UI
                .collect(Collectors.toList());
    }

    /**
     * The AI Brain of the system.
     * Parses natural language and maps to database intents.
     */
    public List<Book> smartAgent(String query) {
        String q = query.toLowerCase();
        
        // 1. Availability Intent (e.g., "What is free?")
        if (q.contains("available") || q.contains("free") || q.contains("in stock")) {
            return repo.findAll().stream().filter(b -> b.getCurrentStock() > 0).toList();
        }

        // 2. Keyword Search Intent (e.g., "Show me Java books")
        // We clean the string to remove common "filler" words
        String cleanedSubject = q.replaceAll("(?i)show|me|books|about|find|search|give|the", "").trim();
        
        String[] words = cleanedSubject.split("\\s+");
        return repo.findAll().stream()
                .filter(b -> {
                    for (String word : words) {
                        if (word.length() < 2) continue; // Ignore tiny words
                        if (b.getTitle().toLowerCase().contains(word) || 
                            b.getAuthor().toLowerCase().contains(word) || 
                            b.getCategory().toLowerCase().contains(word)) {
                            return true;
                        }
                    }
                    return false;
                })
                .collect(Collectors.toList());
    }

    // ... Other existing methods (updateBook, deleteBook, getBooksByLocation)
}