package com.example.fashionstorebackend.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@RestController
public class SpaController {

    @GetMapping(value = {
            "/",
            "/product/**",
            "/catalog",
            "/cart",
            "/checkout",
            "/account"
    })
    public ResponseEntity<Resource> serveIndex(HttpServletRequest request) throws IOException {
        Resource resource = new ClassPathResource("/static/index.html");

        if (resource.exists() && resource.isReadable()) {
            return ResponseEntity.ok()
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}