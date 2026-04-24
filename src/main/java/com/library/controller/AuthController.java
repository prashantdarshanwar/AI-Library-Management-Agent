package com.library.controller;

import com.library.model.User;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder encoder;

    // ✅ REGISTER
    @PostMapping("/register")
    public User register(@RequestBody User user) {

        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
    }

    // ✅ LOGIN
    @PostMapping("/login")
public String login(@RequestBody User loginUser) {

    User user = repo.findByEmail(loginUser.getEmail())
            .orElse(null);

    if (user == null) {
        return "User not found ❌";
    }

    if (!encoder.matches(loginUser.getPassword(), user.getPassword())) {
        return "Invalid password ❌";
    }

    return "Login Successful ✅";
}
}