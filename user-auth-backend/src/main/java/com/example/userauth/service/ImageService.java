package com.example.userauth.service;

import com.example.userauth.model.Image;
import com.example.userauth.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.Base64;

@Service
public class ImageService {

    @Autowired
    private ImageRepository imageRepository;

    public Image saveImage(String email, MultipartFile image) {
        validateImage(image);
        String imageData = convertToBase64(image);
        Image imageObj = new Image(email, imageData);
        return imageRepository.save(imageObj);
    }

    public Image updateImage(String email, MultipartFile image) {
        validateImage(image);
        imageRepository.deleteByEmail(email);
        return saveImage(email, image);
    }

    public Image getImageByEmail(String email) {
        return imageRepository.findByEmail(email);
    }

    public void deleteByEmail(String email) {
        imageRepository.deleteByEmail(email);
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new RuntimeException("Image cannot be empty");
        }
        long size = image.getSize();
        if (size < 150 * 1024 || size > 200 * 1024) {
            throw new RuntimeException("Image size must be between 150KB and 200KB");
        }
        String contentType = image.getContentType();
        if (!Arrays.asList("image/png", "image/jpeg").contains(contentType)) {
            throw new RuntimeException("Only PNG and JPEG images are allowed");
        }
    }

    private String convertToBase64(MultipartFile image) {
        try {
            byte[] bytes = image.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String mimeType = image.getContentType();
            return "data:" + mimeType + ";base64," + base64;
        } catch (IOException e) {
            throw new RuntimeException("Failed to process image", e);
        }
    }
}
