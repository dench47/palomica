package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/admin/s3/files")
@CrossOrigin(origins = "http://localhost:5173")
public class S3FileController {

    @Autowired
    private S3Service s3Service;

    // Загрузка одного файла
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder,
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            // Проверка типа файла
            if (!isValidImageFile(file.getOriginalFilename())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Недопустимый формат файла. Разрешены: jpg, jpeg, png, gif, webp"
                ));
            }

            // Проверка размера (макс 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Файл слишком большой. Максимум 10MB"
                ));
            }

            String fileUrl = s3Service.uploadFile(file, folder);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "url", fileUrl,
                    "fileName", file.getOriginalFilename(),
                    "size", file.getSize(),
                    "message", "Файл успешно загружен"
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки файла: " + e.getMessage()
            ));
        }
    }

    // Загрузка нескольких файлов
    @PostMapping("/upload-multiple")
    public ResponseEntity<?> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("folder") String folder,
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        List<Map<String, Object>> uploadedFiles = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                if (!isValidImageFile(file.getOriginalFilename())) {
                    errors.add("Файл " + file.getOriginalFilename() + ": недопустимый формат");
                    continue;
                }

                if (file.getSize() > 10 * 1024 * 1024) {
                    errors.add("Файл " + file.getOriginalFilename() + ": слишком большой (макс 10MB)");
                    continue;
                }

                String fileUrl = s3Service.uploadFile(file, folder);

                uploadedFiles.add(Map.of(
                        "originalName", file.getOriginalFilename(),
                        "url", fileUrl,
                        "size", file.getSize()
                ));

            } catch (IOException e) {
                errors.add("Ошибка загрузки " + file.getOriginalFilename() + ": " + e.getMessage());
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "uploadedFiles", uploadedFiles,
                "totalUploaded", uploadedFiles.size(),
                "totalFailed", errors.size(),
                "errors", errors
        ));
    }

    // Удаление файла
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteFile(
            @RequestParam("url") String fileUrl,
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            s3Service.deleteFile(fileUrl);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Файл удален"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка удаления файла"
            ));
        }
    }

    // Проверка авторизации
    private boolean isAdmin(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        // Здесь будет проверка JWT токена
        // Пока возвращаем true для теста
        return true;
    }

    // Проверка формата файла
    private boolean isValidImageFile(String filename) {
        if (filename == null) return false;
        String[] allowedExtensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"};
        String lowerCaseFilename = filename.toLowerCase();
        for (String ext : allowedExtensions) {
            if (lowerCaseFilename.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    // S3FileController.java - добавляем эндпоинты
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<?> deleteMultipleFiles(
            @RequestBody List<String> fileUrls,
            HttpServletRequest request) {

        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            s3Service.deleteMultipleFiles(fileUrls);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Файлы удалены из S3",
                    "deletedCount", fileUrls.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка удаления файлов: " + e.getMessage()
            ));
        }
    }


}