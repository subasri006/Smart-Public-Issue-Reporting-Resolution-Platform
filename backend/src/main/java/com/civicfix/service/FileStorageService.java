package com.civicfix.service;

import com.civicfix.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:./uploads/complaints}")
    private String uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".webp");
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private Path uploadPath;

    @PostConstruct
    public void init() {
        try {
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload folder: " + uploadDir, e);
        }
    }

    public StoredFile storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds 5MB limit");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        String contentType = file.getContentType();

        // Security check: path traversal
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Invalid file name: " + originalFilename);
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Invalid file extension: " + extension + ". Allowed: jpg, jpeg, png, webp");
        }

        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid content type: " + contentType + ". Allowed: JPEG, PNG, WEBP");
        }

        // Validate image magic bytes
        byte[] header = new byte[12];
        int bytesRead;
        try (InputStream is = file.getInputStream()) {
            bytesRead = is.read(header, 0, 12);
        } catch (IOException e) {
            throw new BadRequestException("Could not read uploaded file content");
        }

        if (bytesRead < 4 || !isValidImageMagicBytes(header, bytesRead)) {
            throw new BadRequestException("File content signature does not match a valid JPG, JPEG, PNG, or WEBP image format");
        }

        String uniqueFileName = UUID.randomUUID().toString() + extension;
        Path targetLocation = uploadPath.resolve(uniqueFileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return new StoredFile(uniqueFileName, originalFilename, contentType, file.getSize(), targetLocation.toString());
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + uniqueFileName, ex);
        }
    }

    public boolean isValidImageMagicBytes(byte[] header, int length) {
        if (header == null) {
            return false;
        }
        // JPEG / JPG: FF D8 FF
        if (length >= 3 && (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
            return true;
        }
        // PNG: 89 50 4E 47
        if (length >= 4 && (header[0] & 0xFF) == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) {
            return true;
        }
        // WEBP: RIFF....WEBP
        if (length >= 12 && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P') {
            return true;
        }
        return false;
    }

    public Path loadFile(String fileName) {
        // Prevent path traversal
        String cleaned = StringUtils.cleanPath(fileName);
        if (cleaned.contains("..") || cleaned.contains("/") || cleaned.contains("\\")) {
            throw new BadRequestException("Invalid file name");
        }
        return uploadPath.resolve(cleaned).normalize();
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0) {
            return filename.substring(dotIndex);
        }
        return "";
    }

    public static class StoredFile {
        private final String fileName;
        private final String originalName;
        private final String contentType;
        private final long size;
        private final String fullPath;

        public StoredFile(String fileName, String originalName, String contentType, long size, String fullPath) {
            this.fileName = fileName;
            this.originalName = originalName;
            this.contentType = contentType;
            this.size = size;
            this.fullPath = fullPath;
        }

        public String getFileName() { return fileName; }
        public String getOriginalName() { return originalName; }
        public String getContentType() { return contentType; }
        public long getSize() { return size; }
        public String getFullPath() { return fullPath; }
    }
}
