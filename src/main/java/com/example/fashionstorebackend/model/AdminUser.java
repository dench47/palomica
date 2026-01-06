package com.example.fashionstorebackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "admin_users")
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "ROLE_ADMIN"; // ← ДОБАВЬТЕ ПРЕФИКС

    @Column(nullable = false)
    private boolean active = true;

    public AdminUser() {}

    public AdminUser(String username, String password) {
        this.username = username;
        this.password = password;
    }
}