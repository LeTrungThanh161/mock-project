package com.dormitory.management.modules.contract.controller;

import com.dormitory.management.modules.contract.dto.TemporaryAbsenceRequest;
import com.dormitory.management.modules.contract.dto.TemporaryAbsenceResponse;
import com.dormitory.management.modules.contract.service.TemporaryAbsenceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/temporary-absences")
@RequiredArgsConstructor
public class TemporaryAbsenceController {

    private final TemporaryAbsenceService absenceService;

    // Student: Xin tạm vắng
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<TemporaryAbsenceResponse> submitAbsence(
            HttpServletRequest request,
            @RequestBody TemporaryAbsenceRequest absenceRequest) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(absenceService.submitAbsence(accountId, absenceRequest));
    }

    // Student: Xem đơn của mình
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<TemporaryAbsenceResponse>> getMyAbsences(HttpServletRequest request) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.ok(absenceService.getStudentAbsences(accountId));
    }

    // Admin/Manager: Lấy danh sách
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<TemporaryAbsenceResponse>> getAllAbsences() {
        return ResponseEntity.ok(absenceService.getAllAbsences());
    }

    // Admin/Manager: Duyệt đơn
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TemporaryAbsenceResponse> approveAbsence(@PathVariable Integer id) {
        return ResponseEntity.ok(absenceService.approveAbsence(id));
    }
}
