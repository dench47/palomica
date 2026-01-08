package com.example.fashionstorebackend.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Service
public class S3Service {

    private static final Logger log = LoggerFactory.getLogger(S3Service.class); // Добавляем логгер

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
        log.info("Deleted file from S3: {}", s3Key);
    }

    // Удаление нескольких файлов
    public void deleteMultipleFiles(List<String> fileUrls) {
        if (fileUrls == null || fileUrls.isEmpty()) return;

        int deletedCount = 0;
        for (String fileUrl : fileUrls) {
            try {
                deleteFile(fileUrl);
                deletedCount++;
            } catch (Exception e) {
                log.error("Error deleting file {}: {}", fileUrl, e.getMessage());
                // Продолжаем удалять остальные файлы
            }
        }
        log.info("Deleted {} files from S3", deletedCount);
    }

    // Удаление файлов по префиксу
    public void deleteFilesByPrefix(String prefix) {
        try {
            // Получаем список всех файлов с указанным префиксом
            ObjectListing objectListing = amazonS3.listObjects(bucketName, prefix);

            int deletedCount = 0;
            for (S3ObjectSummary objectSummary : objectListing.getObjectSummaries()) {
                amazonS3.deleteObject(bucketName, objectSummary.getKey());
                deletedCount++;
            }

            // Если файлов больше 1000 (пагинация)
            while (objectListing.isTruncated()) {
                objectListing = amazonS3.listNextBatchOfObjects(objectListing);
                for (S3ObjectSummary objectSummary : objectListing.getObjectSummaries()) {
                    amazonS3.deleteObject(bucketName, objectSummary.getKey());
                    deletedCount++;
                }
            }

            log.info("Deleted {} files with prefix {}", deletedCount, prefix);

        } catch (Exception e) {
            log.error("Error deleting files with prefix {}: {}", prefix, e.getMessage());
            throw e;
        }
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
        if (fileUrl.startsWith(baseUrl)) {
            return fileUrl.substring(baseUrl.length() + 1); // +1 чтобы убрать слеш
        }
        return fileUrl; // Если URL уже без baseUrl
    }


}