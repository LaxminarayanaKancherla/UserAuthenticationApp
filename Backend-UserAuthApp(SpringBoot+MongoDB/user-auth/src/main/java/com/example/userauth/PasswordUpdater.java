package com.example.userauth;
//
//import com.example.userauth.model.User;
//import com.example.userauth.repository.UserRepository;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Component;
//
//@Component
//public class PasswordUpdater {
//
//    @Bean
//    public CommandLineRunner updatePasswords(UserRepository userRepository, PasswordEncoder passwordEncoder) {
//        return args -> {
//            userRepository.findAll().forEach(user -> {
//                if (!user.getPassword().startsWith("$2a$")) {
//                    System.out.println("Hashing password for user: " + user.getEmail());
//                    user.setPassword(passwordEncoder.encode(user.getPassword()));
//                    userRepository.save(user);
//                }
//            });
//            System.out.println("Password update completed for all users.");
//        };
//    }
//}