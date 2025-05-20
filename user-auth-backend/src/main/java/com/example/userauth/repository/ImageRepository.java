package com.example.userauth.repository;

import com.example.userauth.model.Image;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ImageRepository extends MongoRepository<Image, String> {
    Image findByEmail(String email);
    boolean existsByEmail(String email);
    void deleteByEmail(String email);
}