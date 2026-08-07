package com.dormitory.management.modules.auth.controller;

import com.dormitory.management.modules.auth.dto.*;
import com.dormitory.management.modules.auth.service.AdminAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminAccountService adminAccountService;

    // ─── Staff (Ban quản lý) ──────────────────────────────────────────────────

    // GET /api/admin/staff — lấy danh sách toàn bộ Staff
    @GetMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StaffResponse>> getAllStaff() {
        return ResponseEntity.ok(adminAccountService.getAllStaff());
    }

    // POST /api/admin/staff — tạo tài khoản Manager mới
    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponse> createManager(@RequestBody CreateManagerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminAccountService.createManagerAccount(request));
    }

    // PUT /api/admin/staff/{id} — cập nhật thông tin / trạng thái Staff
    @PutMapping("/staff/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffResponse> updateStaff(
            @PathVariable Integer id,
            @RequestBody UpdateStaffRequest request) {
        return ResponseEntity.ok(adminAccountService.updateStaff(id, request));
    }

    // ─── Students ────────────────────────────────────────────────────────────

    // GET /api/admin/students?page=0&size=10&search=... — danh sách sinh viên có
    // phân trang
    @GetMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<StudentAccountResponse>> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) String buildingName,
            @RequestParam(required = false) com.dormitory.management.constants.AccountStatus status,
            @RequestParam(required = false) Boolean hasRoom) {
        return ResponseEntity
                .ok(adminAccountService.getAllStudents(page, size, search, className, buildingName, status, hasRoom));
    }

    // POST /api/admin/students/{accountId}/reset-password — reset mật khẩu về
    // "123456"
    @PostMapping("/students/{accountId}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> resetStudentPassword(@PathVariable Integer accountId) {
        adminAccountService.resetStudentPassword(accountId);
        return ResponseEntity.ok("Đặt lại mật khẩu thành công. Mật khẩu mới: 123456");
    }

    // POST /api/admin/students/{accountId}/toggle-status — khóa/mở khóa tài khoản
    // Student
    @PostMapping("/students/{accountId}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentAccountResponse> toggleStudentStatus(@PathVariable Integer accountId) {
        return ResponseEntity.ok(adminAccountService.toggleStudentStatus(accountId));
    }
}
