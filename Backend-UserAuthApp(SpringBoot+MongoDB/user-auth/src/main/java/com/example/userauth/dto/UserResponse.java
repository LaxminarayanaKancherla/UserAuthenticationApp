package com.example.userauth.dto;

public class UserResponse {
    private String email;
    private String username;
    private String phone;
    private int age;
    private String role;

    public UserResponse(String email, String username, String phone, int age, String role) {
        this.email = email;
        this.username = username;
        this.phone = phone;
        this.age = age;
        this.role = role;
    }

    // Getters and setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}