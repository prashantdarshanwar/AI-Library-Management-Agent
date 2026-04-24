package com.library.repository;

import com.library.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookRepository extends JpaRepository<Book, Integer> {

    // 🔍 Search (Title OR Author)
    List<Book> findByTitleContainingOrAuthorContaining(String title, String author);

    // 🤖 Recommendation (by category)
    List<Book> findByCategory(String category);

    // 🔥 Smart recommendation (only available books)
    List<Book> findByCategoryAndAvailableTrue(String category);

    // 📍 NEW: Find by location (Rack)
    List<Book> findByLocation(String location);

    // ✅ NEW: Available books
    List<Book> findByAvailable(boolean available);

    //
    List<Book> findByTitleContainingIgnoreCase(String title);
}

