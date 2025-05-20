package com.example.userauth.controller;

import com.example.userauth.dto.*;
import com.example.userauth.model.Image;
import com.example.userauth.model.Role;
import com.example.userauth.model.User;
import com.example.userauth.repository.UserRepository;
import com.example.userauth.service.ImageService;
import com.example.userauth.util.JwtUtil;
import com.example.userauth.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

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

    @Autowired 
    private RoleService roleService;

    @Autowired
    private ImageService imageService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtil.generateToken(authentication.getName());
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Image image = imageService.getImageByEmail(loginRequest.getEmail());
            UserResponse userResponse = new UserResponse(
                    user.getUsername(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getAge(),
                    user.getRole(),
                    image != null ? image.getImageData() : null
            );
            return ResponseEntity.ok(new JwtResponse(jwt, userResponse));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping(value = "/register", consumes = {"multipart/form-data"})
    public ResponseEntity<?> register(
            @RequestPart("user") @Valid RegisterRequest registerRequest,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }

        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getPhone(),
                registerRequest.getAge(),
                "USER"
        );

        userRepository.save(user);

        if (image != null && !image.isEmpty()) {
            imageService.saveImage(registerRequest.getEmail(), image);
        }

        return ResponseEntity.ok("User registered successfully!");
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Image image = imageService.getImageByEmail(email);
        UserResponse userResponse = new UserResponse(
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getAge(),
                user.getRole(),
                image != null ? image.getImageData() : null
        );
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLEMASTER')")
    public ResponseEntity<?> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream().map(user -> {
            Image image = imageService.getImageByEmail(user.getEmail());
            return new UserResponse(
                    user.getUsername(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getAge(),
                    user.getRole(),
                    image != null ? image.getImageData() : null
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping(value = "/admin/user", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLEMASTER')")
    public ResponseEntity<?> addUser(
            @RequestPart("user") @Valid RegisterRequest registerRequest,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }
        if (!roleService.isValidRole(registerRequest.getRole())) {
            return ResponseEntity.badRequest().body("Invalid role!");
        }
        if (registerRequest.getRole().equals("ADMIN") && !SecurityContextHolder.getContext().getAuthentication().getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Only ADMIN can create ADMIN users!");
        }

        User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getPhone(),
                registerRequest.getAge(),
                registerRequest.getRole()
        );

        userRepository.save(user);

        if (image != null && !image.isEmpty()) {
            imageService.saveImage(registerRequest.getEmail(), image);
        }

        return ResponseEntity.ok("User added successfully!");
    }

    @PutMapping(value = "/admin/user/{email}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLEMASTER')")
    public ResponseEntity<?> updateUser(
            @PathVariable String email,
            @RequestPart("user") @Valid UpdateUserRequest updateRequest,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!roleService.isValidRole(updateRequest.getRole())) {
            return ResponseEntity.badRequest().body("Invalid role!");
        }
        if (updateRequest.getRole().equals("ADMIN") && !SecurityContextHolder.getContext().getAuthentication().getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Only ADMIN can assign ADMIN role!");
        }

        user.setUsername(updateRequest.getUsername());
        user.setPhone(updateRequest.getPhone());
        user.setAge(updateRequest.getAge());
        user.setRole(updateRequest.getRole());

        userRepository.save(user);

        if (image != null && !image.isEmpty()) {
            imageService.updateImage(email, image);
        }

        Image savedImage = imageService.getImageByEmail(email);
        UserResponse userResponse = new UserResponse(
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getAge(),
                user.getRole(),
                savedImage != null ? savedImage.getImageData() : null
        );
        return ResponseEntity.ok(userResponse);
    }

    @DeleteMapping("/admin/user/{email}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLEMASTER')")
    public ResponseEntity<?> deleteUser(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole().equals("ADMIN") && !SecurityContextHolder.getContext().getAuthentication().getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("Only ADMIN can delete ADMIN users!");
        }

        userRepository.delete(user);
        imageService.deleteByEmail(email);
        return ResponseEntity.ok("User deleted successfully!");
    }

    @PostMapping("/admin/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createRole(@Valid @RequestBody RoleRequest roleRequest) {
        Role role = roleService.createRole(roleRequest.getName());
        return ResponseEntity.ok(new RoleResponse(role.getName()));
    }

    @PutMapping("/admin/role/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(@PathVariable String name, @Valid @RequestBody RoleRequest roleRequest) {
        Role updatedRole = roleService.updateRole(name, roleRequest.getName());
        return ResponseEntity.ok(new RoleResponse(updatedRole.getName()));
    }

    @DeleteMapping("/admin/role/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRole(@PathVariable String name) {
        roleService.deleteRole(name);
        return ResponseEntity.ok("Role deleted successfully!");
    }

    @GetMapping("/admin/roles")
    @PreAuthorize("hasAnyRole('ADMIN', 'ROLEMASTER')")
    public ResponseEntity<?> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllRoles().stream()
                .map(role -> new RoleResponse(role.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }

    @PostMapping(value = "/image", consumes = {"multipart/form-data"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadImage(
            @RequestPart("email") String email,
            @RequestPart("image") MultipartFile image) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();
        if (!currentEmail.equals(email) && !authentication.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("You can only upload images for your own account!");
        }
        Image savedImage = imageService.updateImage(email, image);
        return ResponseEntity.ok(new ImageResponse(savedImage.getEmail(), savedImage.getImageData()));
    }

    @GetMapping("/image/{email}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getImage(@PathVariable String email) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();
        if (!currentEmail.equals(email) && !authentication.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body("You can only view your own image!");
        }
        Image image = imageService.getImageByEmail(email);
        if (image == null) {
            return ResponseEntity.ok(new ImageResponse(email, null));
        }
        return ResponseEntity.ok(new ImageResponse(image.getEmail(), image.getImageData()));
    }
}