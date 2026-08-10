package com.dormitory.management.modules.auth.security;

import com.dormitory.management.modules.auth.repository.AccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filter 1: Đọc Bearer token → xác thực → set SecurityContextHolder.
 * Chạy trước mọi request có Authorization header.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AccountRepository accountRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        if (!jwtService.validateToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        Integer accountId = jwtService.extractAccountId(token);
        String role = jwtService.extractRole(token);
        Integer buildingId = jwtService.extractBuildingId(token);

        // Gắn thêm buildingId vào attribute để RlsContextFilter lấy được
        request.setAttribute("accountId", accountId);
        request.setAttribute("role", role);
        request.setAttribute("buildingId", buildingId);

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            var account = accountRepository.findById(accountId).orElse(null);
            if (account != null) {
                var authToken = new UsernamePasswordAuthenticationToken(
                        account,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
