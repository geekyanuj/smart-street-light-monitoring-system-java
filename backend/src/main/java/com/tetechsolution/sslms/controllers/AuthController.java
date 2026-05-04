package com.tetechsolution.sslms.controllers;

import com.tetechsolution.sslms.config.JwtUtils;
import com.tetechsolution.sslms.models.User;
import com.tetechsolution.sslms.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sslms/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, 
                          UserDetailsService userDetailsService, 
                          JwtUtils jwtUtils,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        final String jwt = jwtUtils.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("username", username);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/setup")
    public ResponseEntity<?> setup(@RequestBody Map<String, String> request) {
        if (userRepository.count() > 0) {
            return ResponseEntity.badRequest().body("System already setup");
        }

        User admin = new User();
        admin.setUsername(request.getOrDefault("username", "admin"));
        admin.setPassword(passwordEncoder.encode(request.getOrDefault("password", "admin123")));
        admin.setRole("ROLE_ADMIN");
        userRepository.save(admin);

        return ResponseEntity.ok("Admin user created successfully");
    }
}
