package com.library.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.AccessLevel;

@Entity
@Table(name = "books")
@Data
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String author;
    private String category;
    private String location;

    private Integer totalQuantity; 
    private Integer currentStock;  

    @Getter(AccessLevel.NONE) // 🔥 Prevents Lombok from making a conflicting getAvailable()
    private boolean available;

    /**
     * CUSTOM GETTER
     * This ensures the frontend and service always see the TRUE availability
     * based on count, not just a static checkbox.
     */
    public boolean isAvailable() {
        // A book is "Available" as long as there is 1 or more in stock
        return currentStock != null && currentStock > 0;
    }
}