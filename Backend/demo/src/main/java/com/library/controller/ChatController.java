package com.library.controller;

import com.library.model.Book;
import com.library.service.BookService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin
public class ChatController {

    @Autowired
    private BookService service;

    // 🤖 CHAT API
    @GetMapping
    public Map<String, Object> chat(@RequestParam String message) {

        List<Book> books = service.smartAgent(message);

        Map<String, Object> response = new HashMap<>();

        if (books.isEmpty()) {
            response.put("reply", "No books found ❌");
        } else {

            Book b = books.get(0); // take first result

            String reply = "📚 " + b.getTitle() +
                    "\n👤 Author: " + b.getAuthor() +
                    "\n📍 Location: " + b.getLocation() +
                    "\n✅ Available: " + (b.isAvailable() ? "Yes" : "No");

            response.put("reply", reply);
            response.put("data", books);
        }

        return response;
    }
}