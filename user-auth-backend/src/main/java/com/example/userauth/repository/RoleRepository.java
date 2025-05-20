package com.example.userauth.repository;

import com.example.userauth.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoleRepository extends MongoRepository<Role, String> {
    boolean existsByName(String name);
    Role findByName(String name);
}
