package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.dto.AdminLoginRequest;
import com.example.fashionstorebackend.dto.AdminLoginResponse;
import com.example.fashionstorebackend.model.AdminUser;
import com.example.fashionstorebackend.repository.AdminUserRepository;
import com.example.fashionstorebackend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminAuthController {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest loginRequest) {
        Optional<AdminUser> userOptional = adminUserRepository.findByUsername(loginRequest.getUsername());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Пользователь не найден"
            ));
        }

        AdminUser user = userOptional.get();

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Неверный пароль"
            ));
        }

        if (!user.isActive()) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Аккаунт отключен"
            ));
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole());

        return ResponseEntity.ok(new AdminLoginResponse(
                token,
                user.getUsername(),
                user.getRole()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AdminLoginRequest registerRequest) {
        if (adminUserRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Пользователь уже существует"
            ));
        }

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(registerRequest.getUsername());
        adminUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        adminUserRepository.save(adminUser);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Администратор создан"
        ));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("valid", false));
        }

        String token = authHeader.substring(7);
        boolean isValid = jwtService.validateToken(token);

        return ResponseEntity.ok(Map.of("valid", isValid));
    }
}