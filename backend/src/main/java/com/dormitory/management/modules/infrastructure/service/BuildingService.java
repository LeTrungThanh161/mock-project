package com.dormitory.management.modules.infrastructure.service;

import com.dormitory.management.modules.infrastructure.dto.BuildingRequest;
import com.dormitory.management.modules.infrastructure.dto.BuildingResponse;
import com.dormitory.management.modules.infrastructure.entity.Building;
import com.dormitory.management.modules.infrastructure.repository.BuildingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BuildingService {

    private final BuildingRepository buildingRepository;

    public List<BuildingResponse> getAllBuildings() {
        return buildingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BuildingResponse getBuildingById(Integer id) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Building not found with id: " + id));
        return mapToResponse(building);
    }

    @Transactional
    public BuildingResponse createBuilding(BuildingRequest request) {
        if (buildingRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Building name already exists");
        }
        
        Building building = Building.builder()
                .name(request.getName())
                .genderType(request.getGenderType())
                .totalFloors(request.getTotalFloors())
                .build();
                
        Building savedBuilding = buildingRepository.save(building);
        return mapToResponse(savedBuilding);
    }

    @Transactional
    public BuildingResponse updateBuilding(Integer id, BuildingRequest request) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Building not found with id: " + id));

        if (!building.getName().equals(request.getName()) && buildingRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Building name already exists");
        }

        building.setName(request.getName());
        building.setGenderType(request.getGenderType());
        building.setTotalFloors(request.getTotalFloors());

        Building updatedBuilding = buildingRepository.save(building);
        return mapToResponse(updatedBuilding);
    }

    @Transactional
    public void deleteBuilding(Integer id) {
        if (!buildingRepository.existsById(id)) {
            throw new IllegalArgumentException("Building not found with id: " + id);
        }
        // TODO: Cần check thêm logic có phòng/hợp đồng đang hoạt động trong tòa nhà này hay không trước khi xóa.
        buildingRepository.deleteById(id);
    }

    private BuildingResponse mapToResponse(Building building) {
        return BuildingResponse.builder()
                .buildingId(building.getBuildingId())
                .name(building.getName())
                .genderType(building.getGenderType())
                .totalFloors(building.getTotalFloors())
                .build();
    }
}
