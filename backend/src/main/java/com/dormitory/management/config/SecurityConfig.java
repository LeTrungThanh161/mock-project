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

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import java.util.List;

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
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth

                                                // ── [0] BẮT BUỘC: CHO PHÉP TẤT CẢ REQUEST OPTIONS (CORS PREFLIGHT) ──────
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                                // ── [1] AUTH — Công khai
                                                // ──────────────────────────────────────────────
                                                .requestMatchers(
                                                                "/api/auth/login",
                                                                "/api/auth/register",
                                                                "/api/auth/reset-password",
                                                                "/api/auth/check-email",
                                                                "/api/auth/debug-token")
                                                .permitAll()

                                                // ── [1.5] MANAGER CÓ THỂ XEM PRICING TIERS & TÀI KHOẢN ─────────────────────────
                                                .requestMatchers(HttpMethod.GET, "/api/admin/pricing-tiers")
                                                .hasAnyRole("ADMIN", "MANAGER")

                                                // Manager xem danh sách sinh viên và ban quản lý (chỉ đọc)
                                                .requestMatchers(HttpMethod.GET, "/api/admin/students", "/api/admin/staff")
                                                .hasAnyRole("ADMIN", "MANAGER")

                                                // Manager thao tác trên tài khoản sinh viên (reset pass, khóa/mở khóa)
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/admin/students/*/reset-password",
                                                                "/api/admin/students/*/toggle-status")
                                                .hasAnyRole("ADMIN", "MANAGER")

                                                // ── [2] ADMIN ONLY
                                                // ────────────────────────────────────────────────────
                                                .requestMatchers(
                                                                "/api/admin/**", // toàn bộ trang admin
                                                                "/api/admin/accounts/**", // quản lý tài khoản
                                                                "/api/admin/staff/**", // quản lý nhân viên
                                                                "/api/admin/buildings/**", // quản lý tòa nhà
                                                                "/api/admin/room-types/**", // cấu hình loại phòng
                                                                "/api/admin/pricing-tiers/**", // cấu hình giá lũy tiến
                                                                "/api/statistics/revenue" // doanh thu toàn hệ thống
                                                ).hasRole("ADMIN")

                                                // ── [3] ADMIN hoặc MANAGER
                                                // ────────────────────────────────────────────
                                                // Infrastructure
                                                .requestMatchers(
                                                                "/api/buildings/**",
                                                                "/api/technicians/**")
                                                .hasAnyRole("ADMIN", "MANAGER")

                                                // /api/rooms: ADMIN, MANAGER (sửa/xóa/xem), STUDENT (xem phòng trống)
                                                .requestMatchers(
                                                                "/api/rooms/available")
                                                .hasAnyRole("ADMIN", "MANAGER", "STUDENT")

                                                .requestMatchers(
                                                                "/api/rooms/**")
                                                .hasAnyRole("ADMIN", "MANAGER")

                                                // Nghiệp vụ duyệt/xử lý (RLS tự lọc theo tòa nhà của Manager)
                                                .requestMatchers(
                                                                "/api/applications/*/approve",
                                                                "/api/applications/*/reject",
                                                                "/api/applications" // GET danh sách (RLS lọc)
                                                ).hasAnyRole("ADMIN", "MANAGER")

                                                .requestMatchers(
                                                                "/api/contracts", // GET danh sách
                                                                "/api/contracts/*/renew" // gia hạn
                                                ).hasAnyRole("ADMIN", "MANAGER")

                                                // Trả phòng: ADMIN, MANAGER và STUDENT (tự trả phòng)
                                                .requestMatchers("/api/contracts/*/checkout")
                                                .hasAnyRole("ADMIN", "MANAGER", "STUDENT")

                                                .requestMatchers(
                                                                "/api/temporary-absences",
                                                                "/api/temporary-absences/*/approve",
                                                                "/api/temporary-absences/*/reject")
                                                .hasAnyRole("ADMIN", "MANAGER")

                                                .requestMatchers(
                                                                "/api/meter-readings", // nhập chỉ số điện/nước
                                                                "/api/meter-readings/**")
                                                .hasAnyRole("ADMIN", "MANAGER")

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

                                                // ── [4] STUDENT ONLY
                                                // ──────────────────────────────────────────────────
                                                .requestMatchers(
                                                                "/api/applications/my", // đơn đăng ký của mình
                                                                "/api/contracts/my", // hợp đồng của mình
                                                                "/api/invoices/my", // hóa đơn của mình
                                                                "/api/issue-tickets/my", // sự cố của mình
                                                                "/api/temporary-absences/my", // đơn tạm vắng của mình
                                                                "/api/students/**")
                                                .hasRole("STUDENT")
                                                .requestMatchers(
                                                                "/api/payments/callback/**")
                                                .permitAll()
                                                // Đăng ký phòng
                                                .requestMatchers(
                                                                "/api/contracts/register")
                                                .hasAnyRole("STUDENT", "ADMIN", "MANAGER")

                                                // ── [5] STUDENT — Tự nộp đơn (POST) ─────────────────────────────────
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
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // Dùng setAllowedOriginPatterns để hỗ trợ wildcard cho Vercel và Localhost
                configuration.setAllowedOriginPatterns(List.of(
                        "https://quanliktxcpt.vercel.app",
                        "https://*.vercel.app",
                        "http://localhost:5173",
                        "http://localhost:3000"
                ));

                // Cho phép đầy đủ các HTTP Methods
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

                // Cho phép gửi các Headers (như Authorization Bearer token, Content-Type...)
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setExposedHeaders(List.of("*"));

                // Cho phép truyền Cookie / Authentication Header
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                // Áp dụng cho toàn bộ endpoint
                source.registerCorsConfiguration("/**", configuration);

                return source;
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