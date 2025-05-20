package com.example.userauth.dto;

public class UserResponse {
    private String username;
    private String email;
    private String phone;
    private int age;
    private String role;
    private String image; // Base64 string or URL, matching backend storage

    public UserResponse(String username, String email, String phone, int age, String role, String image) {
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.age = age;
        this.role = role;
        this.image = image;
    }

    // Getters and setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}

