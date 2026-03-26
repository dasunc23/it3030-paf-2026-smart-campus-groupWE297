package com.we297.paf.smart_campus_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.we297.paf.smart_campus_backend.entity.enums.Role;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public User(String name, String email, @Nullable String encode, Role role) {
        this.name = name;
        this.email = email;
        this.password = encode;
        this.role = role;
    }
}