package com.example.fashionstorebackend.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
public class S3Service {

    @Autowired
    private AmazonS3 amazonS3;

    @Value("${beget.s3.bucket-name}")
    private String bucketName;

    @Value("${beget.s3.path-style-url}")
    private String baseUrl;

    // Загрузка файла в S3
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        String fileName = generateFileName(file.getOriginalFilename());
        String s3Key = folder + "/" + fileName;

        try (InputStream inputStream = file.getInputStream()) {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            amazonS3.putObject(bucketName, s3Key, inputStream, metadata);

            // Возвращаем публичный URL
            return baseUrl + "/" + s3Key;
        }
    }

    // Удаление файла из S3
    public void deleteFile(String fileUrl) {
        // Извлекаем путь из URL
        String s3Key = extractKeyFromUrl(fileUrl);
        amazonS3.deleteObject(new DeleteObjectRequest(bucketName, s3Key));
    }

    // Генерация уникального имени файла
    private String generateFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + extension;
    }

    // Получение расширения файла
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf('.')).toLowerCase();
    }

    // Извлечение ключа из URL
    private String extractKeyFromUrl(String fileUrl) {
        // Убираем baseUrl из начала
        return fileUrl.replace(baseUrl + "/", "");
    }
}