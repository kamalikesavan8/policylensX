package com.example.demo;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
    this.userRepository = userRepository;
    this.jwtUtil = jwtUtil;
}

    

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> body) {
        Map<String, String> response = new HashMap<>();

        if (userRepository.findByEmail(body.get("email")).isPresent()) {
            response.put("message", "Email already registered");
            return response;
        }

        User user = new User();
        user.setEmail(body.get("email"));
        user.setPassword(encoder.encode(body.get("password")));
        userRepository.save(user);

        response.put("message", "Registered successfully");
        return response;
    }

    @PostMapping("/login")
public Map<String, String> login(@RequestBody Map<String, String> body) {
    Map<String, String> response = new HashMap<>();

    var userOpt = userRepository.findByEmail(body.get("email"));
    if (userOpt.isEmpty() || !encoder.matches(body.get("password"), userOpt.get().getPassword())) {
        response.put("message", "Invalid email or password");
        return response;
    }

    String token = jwtUtil.generateToken(userOpt.get().getEmail());
    response.put("message", "Login successful");
    response.put("token", token);
    return response;
}
}