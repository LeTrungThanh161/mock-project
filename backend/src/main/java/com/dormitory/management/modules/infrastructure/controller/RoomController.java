package com.dormitory.management.modules.infrastructure.controller;

import com.dormitory.management.modules.infrastructure.dto.RoomRequest;
import com.dormitory.management.modules.infrastructure.dto.RoomResponse;
import com.dormitory.management.modules.infrastructure.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    // Lấy danh sách phòng, hỗ trợ lọc theo buildingId
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms(@RequestParam(required = false) Integer buildingId) {
        return ResponseEntity.ok(roomService.getAllRooms(buildingId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    // Thêm phòng mới: Admin
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(request));
    }

    // Sửa thông tin phòng: Admin hoặc Manager
    // Ở đây dùng hasAnyRole, RLS sẽ tự chặn update nếu Manager sửa phòng của tòa nhà khác
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Integer id, @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    // Xóa phòng: Admin
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Integer id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
    
    // Lấy danh sách các tầng của một tòa nhà
    @GetMapping("/floors")
    public ResponseEntity<List<Integer>> getFloorsByBuildingId(@RequestParam Integer buildingId) {
        return ResponseEntity.ok(roomService.getDistinctFloorNumbers(buildingId));
    }
}
