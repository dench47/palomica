package com.example.fashionstorebackend.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AdminLoginRequest {
    private String username;
    private String password;
}