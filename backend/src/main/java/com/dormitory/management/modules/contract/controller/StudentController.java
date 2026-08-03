package com.dormitory.management.modules.contract.controller;

import com.dormitory.management.modules.contract.dto.StudentResponse;
import com.dormitory.management.modules.contract.dto.StudentUpdateRequest;
import com.dormitory.management.modules.contract.dto.AvailableRoomDTO;
import com.dormitory.management.modules.contract.dto.RoomRegistrationRequest;
import com.dormitory.management.modules.contract.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentResponse> getProfile(HttpServletRequest request) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.ok(studentService.getProfile(accountId));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentResponse> updateProfile(
            HttpServletRequest request,
            @RequestBody StudentUpdateRequest updateRequest) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.ok(studentService.updateProfile(accountId, updateRequest));
    }

    @PostMapping("/contracts/register")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> registerRoom(
            HttpServletRequest request,
            @RequestBody RoomRegistrationRequest registerRequest) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        studentService.registerRoom(accountId, registerRequest.getRoomId());
        return ResponseEntity.ok("Đăng ký phòng và tạo hợp đồng thành công.");
    }
}
