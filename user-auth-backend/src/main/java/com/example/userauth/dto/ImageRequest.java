package com.example.userauth.dto;

import jakarta.validation.constraints.NotBlank;

public class ImageRequest {

    @NotBlank(message = "Email is mandatory")
    private String email;

    @NotBlank(message = "Image data is mandatory")
    private String imageData;

    // Constructors
    public ImageRequest() {}

    public ImageRequest(String email, String imageData) {
        this.email = email;
        this.imageData = imageData;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }
}

