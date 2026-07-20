package com.dormitory.management.modules.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter 2: Sau khi JWT đã được xác thực → gọi sp_SetSecurityContext để DB tự lọc RLS.
 *
 * Lưu ý quan trọng: sp_SetSecurityContext dùng SESSION_CONTEXT gắn với connection vật lý.
 * Với connection pooling (HikariCP), phải gọi lại ở ĐẦU MỖI REQUEST để tránh dữ liệu
 * bị "rò rỉ" giữa các request khác nhau dùng chung connection.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RlsContextFilter extends OncePerRequestFilter {

    private final JdbcTemplate jdbcTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String role = (String) request.getAttribute("role");
        Integer buildingId = (Integer) request.getAttribute("buildingId");

        if (role != null) {
            try {
                if ("Admin".equalsIgnoreCase(role)) {
                    jdbcTemplate.execute("EXEC dbo.sp_SetSecurityContext @Role = N'Admin'");
                } else if ("Manager".equalsIgnoreCase(role) && buildingId != null) {
                    jdbcTemplate.update("EXEC dbo.sp_SetSecurityContext @Role = N'Manager', @BuildingId = ?",
                            buildingId);
                } else if ("Student".equalsIgnoreCase(role)) {
                    jdbcTemplate.execute("EXEC dbo.sp_SetSecurityContext @Role = N'Student'");
                }
            } catch (Exception e) {
                log.warn("Không thể set RLS context: {}", e.getMessage());
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Reset context sau mỗi request để tránh rò rỉ context với connection pool
            try {
                jdbcTemplate.execute("EXEC dbo.sp_SetSecurityContext @Role = NULL");
            } catch (Exception ignored) {
                // Bỏ qua nếu không reset được
            }
        }
    }
}
