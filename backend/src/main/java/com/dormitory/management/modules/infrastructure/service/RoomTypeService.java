package com.dormitory.management.modules.infrastructure.service;

import com.dormitory.management.modules.infrastructure.dto.RoomTypeRequest;
import com.dormitory.management.modules.infrastructure.dto.RoomTypeResponse;
import com.dormitory.management.modules.infrastructure.entity.RoomType;
import com.dormitory.management.modules.infrastructure.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    public List<RoomTypeResponse> getAllRoomTypes() {
        return roomTypeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RoomTypeResponse getRoomTypeById(Integer id) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RoomType not found with id: " + id));
        return mapToResponse(roomType);
    }

    @Transactional
    public RoomTypeResponse createRoomType(RoomTypeRequest request) {
        if (roomTypeRepository.existsByTypeName(request.getTypeName())) {
            throw new IllegalArgumentException("RoomType name already exists");
        }

        RoomType roomType = RoomType.builder()
                .typeName(request.getTypeName())
                .defaultCapacity(request.getDefaultCapacity())
                .defaultPrice(request.getDefaultPrice())
                .build();

        RoomType savedRoomType = roomTypeRepository.save(roomType);
        return mapToResponse(savedRoomType);
    }

    @Transactional
    public RoomTypeResponse updateRoomType(Integer id, RoomTypeRequest request) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RoomType not found with id: " + id));

        if (!roomType.getTypeName().equals(request.getTypeName()) && roomTypeRepository.existsByTypeName(request.getTypeName())) {
            throw new IllegalArgumentException("RoomType name already exists");
        }

        roomType.setTypeName(request.getTypeName());
        roomType.setDefaultCapacity(request.getDefaultCapacity());
        roomType.setDefaultPrice(request.getDefaultPrice());

        RoomType updatedRoomType = roomTypeRepository.save(roomType);
        return mapToResponse(updatedRoomType);
    }

    @Transactional
    public void deleteRoomType(Integer id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new IllegalArgumentException("RoomType not found with id: " + id);
        }
        roomTypeRepository.deleteById(id);
    }

    private RoomTypeResponse mapToResponse(RoomType roomType) {
        return RoomTypeResponse.builder()
                .roomTypeId(roomType.getRoomTypeId())
                .typeName(roomType.getTypeName())
                .defaultCapacity(roomType.getDefaultCapacity())
                .defaultPrice(roomType.getDefaultPrice())
                .build();
    }
}
