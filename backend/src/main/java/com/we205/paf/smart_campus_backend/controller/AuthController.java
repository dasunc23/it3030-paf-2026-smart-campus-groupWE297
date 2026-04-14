package com.we205.paf.smart_campus_backend.controller;


import com.we205.paf.smart_campus_backend.dto.AuthResponse;
import com.we205.paf.smart_campus_backend.dto.LoginRequest;
import com.we205.paf.smart_campus_backend.dto.RegisterRequest;
import com.we205.paf.smart_campus_backend.entity.User;
import com.we205.paf.smart_campus_backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(new AuthResponse(true, "Logged out successfully", null));
    }

    @GetMapping("/user-data")
    public ResponseEntity<AuthResponse> getUserData(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(new AuthResponse(false, "Not authenticated", null));
        }

        Optional<User> userOpt = authService.findByEmail(userDetails.getUsername());
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(new AuthResponse(true, "User data fetched", userOpt.get()));
        }

        return ResponseEntity.ok(new AuthResponse(false, "User not found", null));
    }
}
