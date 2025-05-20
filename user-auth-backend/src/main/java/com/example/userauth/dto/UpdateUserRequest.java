package com.example.userauth.dto;

import jakarta.validation.constraints.*;

public class UpdateUserRequest {

    @NotBlank(message = "Username is mandatory")
    @Size(min = 3, message = "Username must be at least 3 characters long")
    private String username;

    @NotBlank(message = "Phone is mandatory")
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    @Min(value = 0, message = "Age must be a positive number")
    private int age;

    @NotBlank(message = "Role is mandatory")
    private String role;

    private String image; // Base64-encoded image, optional

    // Constructors
    public UpdateUserRequest() {}

    public UpdateUserRequest(String username, String phone, int age, String role, String image) {
        this.username = username;
        this.phone = phone;
        this.age = age;
        this.role = role;
        this.image = image;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

