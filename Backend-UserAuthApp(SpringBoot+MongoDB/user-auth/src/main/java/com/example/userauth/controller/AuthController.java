package com.example.userauth.controller;

import com.example.userauth.dto.ErrorResponse;
import com.example.userauth.dto.LoginRequest;
import com.example.userauth.dto.LoginResponse;
import com.example.userauth.dto.RegisterRequest;
import com.example.userauth.dto.SuccessResponse;
import com.example.userauth.dto.UpdateUserRequest;
import com.example.userauth.dto.UserResponse;
import com.example.userauth.model.User;
import com.example.userauth.repository.UserRepository;
import com.example.userauth.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("AuthController: Login attempt for: " + loginRequest.getEmail());
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            String token = jwtUtil.generateToken(loginRequest.getEmail());
            System.out.println("AuthController: Login successful, token: " + token);
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception e) {
            System.out.println("AuthController: Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid email or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        System.out.println("AuthController: Register attempt for: " + registerRequest.getEmail());
        // Additional email format check
        if (!registerRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid email format"));
        }
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Email already exists"));
        }
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        user.setAge(registerRequest.getAge());
        user.setRole("USER");
        userRepository.save(user);
        System.out.println("AuthController: User registered: " + user.getEmail());
        return ResponseEntity.ok(new SuccessResponse("User registered successfully"));
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUser(Authentication authentication) {
        System.out.println("AuthController: Fetching user, Authentication: " + authentication);
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("AuthController: Unauthorized access to /user");
            return ResponseEntity.status(403).body(new ErrorResponse("Unauthorized access"));
        }
        String email = authentication.getName();
        System.out.println("AuthController: Fetching user for email: " + email);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            System.out.println("AuthController: User not found: " + email);
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        System.out.println("AuthController: User found: " + user.getEmail());
        return ResponseEntity.ok(new UserResponse(user.getEmail(), user.getUsername(), user.getPhone(), user.getAge(), user.getRole()));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<?> getAllUsers() {
        System.out.println("AuthController: Fetching all users");
        List<User> users = userRepository.findAll();
        System.out.println("AuthController: Found " + users.size() + " users");
        return ResponseEntity.ok(users.stream()
                .map(user -> new UserResponse(user.getEmail(), user.getUsername(), user.getPhone(), user.getAge(), user.getRole()))
                .toList());
    }

    @PostMapping("/admin/user")
    public ResponseEntity<?> addUser(@Valid @RequestBody RegisterRequest registerRequest) {
        System.out.println("AuthController: Admin adding user: " + registerRequest.getEmail());
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Email already exists"));
        }
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        user.setAge(registerRequest.getAge());
        user.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : "USER");
        userRepository.save(user);
        System.out.println("AuthController: User added by admin: " + user.getEmail());
        return ResponseEntity.ok(new SuccessResponse("User added successfully"));
    }

    @PutMapping("/admin/user/{email}")
    public ResponseEntity<?> updateUser(@PathVariable String email, @RequestBody UpdateUserRequest updateRequest) {
        System.out.println("AuthController: Updating user: " + email);
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            System.out.println("AuthController: User not found: " + email);
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        User user = userOptional.get();
        user.setUsername(updateRequest.getUsername());
        user.setPhone(updateRequest.getPhone());
        user.setAge(updateRequest.getAge());
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }
        user.setRole(updateRequest.getRole() != null ? updateRequest.getRole() : user.getRole());
        userRepository.save(user);
        System.out.println("AuthController: User updated: " + user.getEmail());
        return ResponseEntity.ok(new SuccessResponse("User updated successfully"));
    }

    @DeleteMapping("/admin/user/{email}")
    public ResponseEntity<?> deleteUser(@PathVariable String email) {
        System.out.println("AuthController: Deleting user: " + email);
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            System.out.println("AuthController: User not found: " + email);
            return ResponseEntity.status(404).body(new ErrorResponse("User not found"));
        }
        userRepository.delete(userOptional.get());
        System.out.println("AuthController: User deleted: " + email);
        return ResponseEntity.ok(new SuccessResponse("User deleted successfully"));
    }
}