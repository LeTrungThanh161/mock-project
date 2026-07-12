package com.dormitory.management.modules.infrastructure.controller;

import com.dormitory.management.modules.infrastructure.dto.RoomTypeRequest;
import com.dormitory.management.modules.infrastructure.dto.RoomTypeResponse;
import com.dormitory.management.modules.infrastructure.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-types")
@RequiredArgsConstructor
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    // Xem danh sách RoomType: Admin, Manager, Student đều cần để xem lúc đăng ký
    @GetMapping
    public ResponseEntity<List<RoomTypeResponse>> getAllRoomTypes() {
        return ResponseEntity.ok(roomTypeService.getAllRoomTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomTypeResponse> getRoomTypeById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomTypeService.getRoomTypeById(id));
    }

    // Chỉ Admin mới được cấu hình giá và sức chứa mặc định của RoomType
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomTypeResponse> createRoomType(@RequestBody RoomTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomTypeService.createRoomType(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomTypeResponse> updateRoomType(@PathVariable Integer id, @RequestBody RoomTypeRequest request) {
        return ResponseEntity.ok(roomTypeService.updateRoomType(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoomType(@PathVariable Integer id) {
        roomTypeService.deleteRoomType(id);
        return ResponseEntity.noContent().build();
    }
}
