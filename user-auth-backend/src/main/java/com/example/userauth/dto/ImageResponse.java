package com.example.userauth.dto;

public class ImageResponse {

    private String email;
    private String imageData;

    // Constructors
    public ImageResponse() {}

    public ImageResponse(String email, String imageData) {
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

