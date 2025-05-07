package com.example.userauth.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.userauth.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String email = null;
        String token = null;

        System.out.println("JwtAuthenticationFilter: Processing request: " + request.getRequestURI());
        System.out.println("JwtAuthenticationFilter: Authorization header: " + header);

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            try {
                email = jwtUtil.extractEmail(token);
                System.out.println("JwtAuthenticationFilter: Extracted email: " + email);
            } catch (Exception e) {
                System.out.println("JwtAuthenticationFilter: Token extraction failed: " + e.getMessage());
            }
        } else {
            System.out.println("JwtAuthenticationFilter: No Bearer token found");
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(token, email)) {
                String role = jwtUtil.extractRole(token);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(() -> "ROLE_" + role));
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("JwtAuthenticationFilter: Authentication set for: " + email + " with role: " + role);
            } else {
                System.out.println("JwtAuthenticationFilter: Token validation failed for email: " + email);
            }
        }

        chain.doFilter(request, response);
    }
}