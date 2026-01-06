package com.example.fashionstorebackend.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AdminLoginResponse {
    private String token;
    private String username;
    private String role;

    public AdminLoginResponse(String token, String username, String role) {
        this.token = token;
        this.username = username;
        this.role = role;
    }
}