package com.dormitory.management.config;

import com.dormitory.management.modules.auth.security.JwtAuthenticationFilter;
import com.dormitory.management.modules.auth.security.RlsContextFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// ========================================================================
// PHÂN QUYỀN THEO ROLE — BẢNG TÓM TẮT
// ========================================================================
//
//  ROLE       | PHẠM VI TRUY CẬP
// ------------|--------------------------------------------------------------
//  Admin      | Toàn hệ thống (mọi endpoint). Không bị RLS giới hạn.
//  Manager    | Chỉ dữ liệu tòa nhà mình phụ trách (RLS tự lọc ở DB).
//  Student    | Chỉ dữ liệu của chính mình (profile, hợp đồng, hóa đơn...).
//
// ========================================================================
// CHI TIẾT ENDPOINT THEO NHÓM TÍNH NĂNG
// ========================================================================
//
// [1] AUTH — Xác thực (/api/auth/**)
//     POST /api/auth/login              → PUBLIC (không cần token)
//     POST /api/auth/register           → PUBLIC (Student tự đăng ký)
//     GET  /api/auth/me                 → ADMIN, MANAGER, STUDENT
//
// [2] ADMIN MANAGEMENT (/api/admin/**)
//     /api/admin/accounts/**            → ADMIN (quản lý tài khoản)
//     /api/admin/staff/**               → ADMIN (tạo/sửa nhân viên)
//     /api/admin/buildings/**           → ADMIN (thêm/sửa/xóa tòa nhà)
//     /api/admin/room-types/**          → ADMIN (cấu hình loại phòng)
//     /api/admin/pricing-tiers/**       → ADMIN (cấu hình giá điện/nước)
//     /api/admin/reports/**             → ADMIN (xem toàn bộ báo cáo)
//
// [3] INFRASTRUCTURE — Tòa nhà & Phòng (/api/buildings/**, /api/rooms/**)
//     GET  /api/buildings/**            → ADMIN, MANAGER (xem danh sách tòa nhà)
//     GET  /api/rooms/**                → ADMIN, MANAGER, STUDENT (Student: xem phòng trống)
//     POST /api/rooms/**                → ADMIN (tạo phòng mới)
//     PUT  /api/rooms/**                → ADMIN, MANAGER (sửa thông tin phòng)
//
// [4] APPLICATIONS — Đăng ký phòng (/api/applications/**)
//     POST /api/applications            → STUDENT (nộp đơn xin phòng)
//     GET  /api/applications/my         → STUDENT (xem đơn của mình)
//     GET  /api/applications            → ADMIN, MANAGER (xem tất cả đơn theo tòa nhà)
//     PUT  /api/applications/{id}/approve  → ADMIN, MANAGER (duyệt đơn)
//     PUT  /api/applications/{id}/reject   → ADMIN, MANAGER (từ chối đơn)
//
// [5] CONTRACTS — Hợp đồng (/api/contracts/**)
//     GET  /api/contracts/my            → STUDENT (xem hợp đồng của mình)
//     GET  /api/contracts               → ADMIN, MANAGER
//     POST /api/contracts/{id}/renew    → ADMIN, MANAGER (gia hạn hợp đồng)
//     POST /api/contracts/{id}/checkout → ADMIN, MANAGER (chấm dứt / trả phòng)
//
// [6] TEMPORARY ABSENCE — Tạm vắng (/api/temporary-absences/**)
//     POST /api/temporary-absences      → STUDENT (nộp đơn xin tạm vắng)
//     GET  /api/temporary-absences/my   → STUDENT (xem đơn tạm vắng của mình)
//     GET  /api/temporary-absences      → ADMIN, MANAGER
//     PUT  /api/temporary-absences/{id}/approve → ADMIN, MANAGER
//
// [7] METER READING — Chỉ số điện/nước (/api/meter-readings/**)
//     POST /api/meter-readings          → ADMIN, MANAGER (nhập chỉ số)
//     GET  /api/meter-readings          → ADMIN, MANAGER
//
// [8] INVOICES — Hóa đơn (/api/invoices/**)
//     GET  /api/invoices/my             → STUDENT (xem hóa đơn của mình)
//     GET  /api/invoices                → ADMIN, MANAGER
//     POST /api/invoices/generate       → ADMIN, MANAGER (xuất hóa đơn hàng loạt)
//     PUT  /api/invoices/{id}/pay       → ADMIN, MANAGER, STUDENT (ghi nhận thanh toán)
//
// [9] ISSUE TICKETS — Báo cáo sự cố (/api/issue-tickets/**)
//     POST /api/issue-tickets           → STUDENT (báo cáo sự cố)
//     GET  /api/issue-tickets/my        → STUDENT (xem sự cố của mình)
//     GET  /api/issue-tickets           → ADMIN, MANAGER
//     PUT  /api/issue-tickets/{id}/assign  → ADMIN, MANAGER (gán kỹ thuật viên)
//     PUT  /api/issue-tickets/{id}/status  → ADMIN, MANAGER (cập nhật trạng thái)
//
// [10] TECHNICIANS — Kỹ thuật viên (/api/technicians/**)
//     GET  /api/technicians             → ADMIN, MANAGER
//     POST /api/technicians             → ADMIN, MANAGER (thêm kỹ thuật viên)
//     PUT  /api/technicians/**          → ADMIN, MANAGER
//
// [11] STATISTICS & REPORTS — Thống kê (/api/statistics/**)
//     GET  /api/statistics/occupancy    → ADMIN, MANAGER
//     GET  /api/statistics/revenue      → ADMIN
//     GET  /api/statistics/overdue      → ADMIN, MANAGER
// ========================================================================

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Bật @PreAuthorize, @PostAuthorize trên Controller/Service
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RlsContextFilter rlsContextFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── [1] AUTH — Công khai ──────────────────────────────────────────────
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register")
                        .permitAll()

                        // ── [2] ADMIN ONLY ────────────────────────────────────────────────────
                        .requestMatchers(
                                "/api/admin/**", // toàn bộ trang admin
                                "/api/admin/accounts/**", // quản lý tài khoản
                                "/api/admin/staff/**", // quản lý nhân viên
                                "/api/admin/buildings/**", // quản lý tòa nhà
                                "/api/admin/room-types/**", // cấu hình loại phòng
                                "/api/admin/pricing-tiers/**", // cấu hình giá lũy tiến
                                "/api/statistics/revenue" // doanh thu toàn hệ thống
                        ).hasRole("ADMIN")

                        // ── [3] ADMIN hoặc MANAGER ────────────────────────────────────────────
                        // Infrastructure
                        .requestMatchers(
                                "/api/buildings/**",
                                "/api/rooms/**",
                                "/api/technicians/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // Nghiệp vụ duyệt/xử lý (RLS tự lọc theo tòa nhà của Manager)
                        .requestMatchers(
                                "/api/applications/*/approve",
                                "/api/applications/*/reject",
                                "/api/applications" // GET danh sách (RLS lọc)
                        ).hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                                "/api/contracts", // GET danh sách
                                "/api/contracts/*/renew", // gia hạn
                                "/api/contracts/*/checkout" // trả phòng
                        ).hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                                "/api/temporary-absences",
                                "/api/temporary-absences/*/approve",
                                "/api/temporary-absences/*/reject")
                        .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                                "/api/meter-readings" // nhập chỉ số điện/nước
                        ).hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                                "/api/invoices", // GET danh sách hóa đơn
                                "/api/invoices/generate" // xuất hóa đơn hàng loạt
                        ).hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                                "/api/issue-tickets",
                                "/api/issue-tickets/*/assign",
                                "/api/issue-tickets/*/status")
                        .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                                "/api/statistics/occupancy",
                                "/api/statistics/overdue")
                        .hasAnyRole("ADMIN", "MANAGER")

                        // ── [4] STUDENT ONLY ──────────────────────────────────────────────────
                        .requestMatchers(
                                "/api/applications/my", // đơn đăng ký của mình
                                "/api/contracts/my", // hợp đồng của mình
                                "/api/invoices/my", // hóa đơn của mình
                                "/api/issue-tickets/my", // sự cố của mình
                                "/api/temporary-absences/my" // đơn tạm vắng của mình
                        ).hasRole("STUDENT")

                        // ── [5] STUDENT — Tự nộp đơn (POST) ─────────────────────────────────
                        // Dùng @PreAuthorize trong Controller để kiểm soát chi tiết hơn
                        .requestMatchers(
                                "/api/applications" // POST nộp đơn
                        ).hasAnyRole("STUDENT", "ADMIN", "MANAGER")

                        // Ghi nhận thanh toán (Student tự thanh toán online)
                        .requestMatchers(
                                "/api/invoices/*/pay")
                        .hasAnyRole("ADMIN", "MANAGER", "STUDENT")

                        // ── [6] TẤT CẢ ĐÃ ĐĂNG NHẬP ─────────────────────────────────────────
                        .anyRequest().authenticated())
                // Thứ tự filter quan trọng: JWT xác thực trước → RLS set context sau
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(rlsContextFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
