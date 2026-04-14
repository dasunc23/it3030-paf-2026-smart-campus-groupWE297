package com.we205.paf.smart_campus_backend.controller;

import com.we205.paf.smart_campus_backend.entity.User;
import com.we205.paf.smart_campus_backend.entity.enums.Role;
import com.we205.paf.smart_campus_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {
    
    private final UserRepository userRepository;
    
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/promote-finance")
    public ResponseEntity<?> promoteToFinance(
            @RequestBody Map<String, String> payload, 
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User admin = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (admin == null || admin.getRole() != Role.ROLE_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Only Admins can promote users"));
        }

        String email = payload.get("email");
        User target = userRepository.findByEmail(email).orElse(null);
        if (target == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }
        
        target.setRole(Role.ROLE_FINANCE);
        userRepository.save(target);
        
        return ResponseEntity.ok(Map.of("message", "User promoted to Finance"));
    }
}
