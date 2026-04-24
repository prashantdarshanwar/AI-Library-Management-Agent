package com.library.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                
                // 1. Full Access for Next.js (Management/Admin)
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");

                // 2. Read-Only Access for Streamlit Chatbot
                registry.addMapping("/api/books/**")
                        .allowedOrigins("http://localhost:8501")
                        .allowedMethods("GET") // Only GET is permitted
                        .allowedHeaders("*");
            }
        };
    }
}