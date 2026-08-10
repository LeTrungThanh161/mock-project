package com.dormitory.management.modules.contract.controller;

import com.dormitory.management.modules.contract.dto.RoomApplicationRequest;
import com.dormitory.management.modules.contract.dto.RoomApplicationResponse;
import com.dormitory.management.modules.contract.service.RoomApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final RoomApplicationService applicationService;

    // Student: Nộp đơn
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RoomApplicationResponse> submitApplication(
            HttpServletRequest request,
            @RequestBody RoomApplicationRequest applicationRequest) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.submitApplication(accountId, applicationRequest));
    }

    // Student: Xem đơn của mình
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<RoomApplicationResponse>> getMyApplications(HttpServletRequest request) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.ok(applicationService.getStudentApplications(accountId));
    }

    // Admin/Manager: Xem tất cả đơn (có lọc theo building)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<RoomApplicationResponse>> getAllApplications(
            @RequestParam(required = false) Integer buildingId) {
        return ResponseEntity.ok(applicationService.getAllApplications(buildingId));
    }

    // Admin/Manager: Duyệt đơn
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RoomApplicationResponse> approveApplication(
            @PathVariable Integer id,
            HttpServletRequest request) {
        Integer staffAccountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.ok(applicationService.approveApplication(id, staffAccountId));
    }

    // Admin/Manager: Từ chối đơn
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RoomApplicationResponse> rejectApplication(
            @PathVariable Integer id,
            @RequestParam String reason,
            HttpServletRequest request) {
        Integer staffAccountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.ok(applicationService.rejectApplication(id, staffAccountId, reason));
    }
}
