package com.dormitory.management.modules.auth.controller;

import com.dormitory.management.modules.auth.dto.*;
import com.dormitory.management.modules.auth.security.JwtService;
import com.dormitory.management.modules.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Auth Controller — xử lý đăng nhập, đăng ký và lấy thông tin tài khoản.
 *
 * Luồng sau khi login thành công:
 *   1. Client nhận JWT chứa role + buildingId
 *   2. Mọi request tiếp theo gửi kèm "Authorization: Bearer <token>"
 *   3. JwtAuthenticationFilter xác thực token → set SecurityContext
 *   4. RlsContextFilter gọi sp_SetSecurityContext → DB tự lọc RLS
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    /**
     * POST /api/auth/login
     * Body: { "email": "...", "password": "..." }
     * Response: { "token": "...", "role": "Manager", "buildingId": 2, "fullName": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/register
     * Dành cho Student tự đăng ký tài khoản.
     * Body: { "email", "password", "studentCode", "fullName", "gender", ... }
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("Đăng ký thành công. Vui lòng đăng nhập.");
    }

    /**
     * GET /api/auth/me
     * Yêu cầu Authorization: Bearer <token>
     * Trả về thông tin tài khoản hiện tại (role, buildingId, fullName...).
     */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> getMe(HttpServletRequest request) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        MeResponse response = authService.getMe(accountId);
        return ResponseEntity.ok(response);
    }
}
