package com.example.userauth.dto;

public class RoleResponse {

    private String name;

    // Constructors
    public RoleResponse() {}

    public RoleResponse(String name) {
        this.name = name;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

