package com.we205.paf.smart_campus_backend.service;


import com.we205.paf.smart_campus_backend.dto.AuthResponse;
import com.we205.paf.smart_campus_backend.dto.LoginRequest;
import com.we205.paf.smart_campus_backend.dto.RegisterRequest;
import com.we205.paf.smart_campus_backend.entity.User;
import com.we205.paf.smart_campus_backend.repository.UserRepository;
import com.we205.paf.smart_campus_backend.security.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new AuthResponse(false, "User already exists", null);
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                com.we205.paf.smart_campus_backend.entity.enums.Role.ROLE_USER // Default role
        );

        User savedUser = userRepository.save(user);
        return new AuthResponse(true, "Registration successful", savedUser);
    }

    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isPresent() && passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            User user = userOpt.get();
            String token = jwtUtils.generateToken(user.getEmail());

            Cookie cookie = new Cookie("token", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Set to true in production with HTTPS
            cookie.setPath("/");
            cookie.setMaxAge(86400); // 1 day
            response.addCookie(cookie);

            return new AuthResponse(true, "Login successful", user);
        }

        return new AuthResponse(false, "Invalid email or password", null);
    }

    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
