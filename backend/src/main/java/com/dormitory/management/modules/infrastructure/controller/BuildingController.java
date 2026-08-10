package com.dormitory.management.modules.infrastructure.controller;

import com.dormitory.management.modules.infrastructure.dto.BuildingRequest;
import com.dormitory.management.modules.infrastructure.dto.BuildingResponse;
import com.dormitory.management.modules.infrastructure.service.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    @GetMapping
    public ResponseEntity<List<BuildingResponse>> getAllBuildings() {
        return ResponseEntity.ok(buildingService.getAllBuildings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BuildingResponse> getBuildingById(@PathVariable Integer id) {
        return ResponseEntity.ok(buildingService.getBuildingById(id));
    }

    // Chỉ Admin mới được quản lý (thêm/sửa/xóa) tòa nhà
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BuildingResponse> createBuilding(@RequestBody BuildingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(buildingService.createBuilding(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BuildingResponse> updateBuilding(@PathVariable Integer id, @RequestBody BuildingRequest request) {
        return ResponseEntity.ok(buildingService.updateBuilding(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBuilding(@PathVariable Integer id) {
        buildingService.deleteBuilding(id);
        return ResponseEntity.noContent().build();
    }
}
