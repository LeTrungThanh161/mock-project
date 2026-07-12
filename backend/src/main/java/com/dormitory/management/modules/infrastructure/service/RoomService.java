package com.dormitory.management.modules.infrastructure.service;

import com.dormitory.management.constants.RoomStatus;
import com.dormitory.management.modules.infrastructure.dto.RoomRequest;
import com.dormitory.management.modules.infrastructure.dto.RoomResponse;
import com.dormitory.management.modules.infrastructure.entity.Building;
import com.dormitory.management.modules.infrastructure.entity.Room;
import com.dormitory.management.modules.infrastructure.entity.RoomType;
import com.dormitory.management.modules.infrastructure.repository.BuildingRepository;
import com.dormitory.management.modules.infrastructure.repository.RoomRepository;
import com.dormitory.management.modules.infrastructure.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;
    private final RoomTypeRepository roomTypeRepository;

    public List<RoomResponse> getAllRooms(Integer buildingId) {
        List<Room> rooms;
        if (buildingId != null) {
            rooms = roomRepository.findByBuilding_BuildingId(buildingId);
        } else {
            rooms = roomRepository.findAll();
        }
        return rooms.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public RoomResponse getRoomById(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + id));
        return mapToResponse(room);
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new IllegalArgumentException("Building not found"));

        RoomType roomType = null;
        if (request.getRoomTypeId() != null) {
            roomType = roomTypeRepository.findById(request.getRoomTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("RoomType not found"));
        }

        if (roomRepository.existsByBuilding_BuildingIdAndRoomNumber(request.getBuildingId(), request.getRoomNumber())) {
            throw new IllegalArgumentException("Room number already exists in this building");
        }

        Room room = Room.builder()
                .building(building)
                .roomType(roomType)
                .roomNumber(request.getRoomNumber())
                .maxCapacity(request.getMaxCapacity() != null ? request.getMaxCapacity() : (roomType != null ? roomType.getDefaultCapacity() : 0))
                .currentOccupancy((byte) 0)
                .price(request.getPrice() != null ? request.getPrice() : (roomType != null ? roomType.getDefaultPrice() : null))
                .status(request.getStatus() != null ? request.getStatus() : RoomStatus.AVAILABLE)
                .build();

        Room savedRoom = roomRepository.save(room);
        
        // Cần fetch lại để DB tính toán floorNumber (computed column PERSISTED). Mặc dù Hibernate không tự lấy computed column về trừ khi Refresh/Find lại.
        return mapToResponse(savedRoom);
    }

    @Transactional
    public RoomResponse updateRoom(Integer id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + id));

        // Nếu thay đổi Building hoặc RoomNumber, check xem có bị trùng không
        if (!room.getBuilding().getBuildingId().equals(request.getBuildingId()) || !room.getRoomNumber().equals(request.getRoomNumber())) {
            if (roomRepository.existsByBuilding_BuildingIdAndRoomNumber(request.getBuildingId(), request.getRoomNumber())) {
                throw new IllegalArgumentException("Room number already exists in this building");
            }
        }

        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new IllegalArgumentException("Building not found"));

        RoomType roomType = null;
        if (request.getRoomTypeId() != null) {
            roomType = roomTypeRepository.findById(request.getRoomTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("RoomType not found"));
        }

        room.setBuilding(building);
        room.setRoomType(roomType);
        room.setRoomNumber(request.getRoomNumber());
        room.setMaxCapacity(request.getMaxCapacity());
        room.setPrice(request.getPrice());
        
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }

        Room updatedRoom = roomRepository.save(room);
        return mapToResponse(updatedRoom);
    }

    @Transactional
    public void deleteRoom(Integer id) {
        if (!roomRepository.existsById(id)) {
            throw new IllegalArgumentException("Room not found with id: " + id);
        }
        roomRepository.deleteById(id);
    }

    private RoomResponse mapToResponse(Room room) {
        return RoomResponse.builder()
                .roomId(room.getRoomId())
                .buildingId(room.getBuilding().getBuildingId())
                .buildingName(room.getBuilding().getName())
                .roomTypeId(room.getRoomType() != null ? room.getRoomType().getRoomTypeId() : null)
                .roomTypeName(room.getRoomType() != null ? room.getRoomType().getTypeName() : null)
                .roomNumber(room.getRoomNumber())
                .floorNumber(room.getFloorNumber())
                .maxCapacity(room.getMaxCapacity())
                .currentOccupancy(room.getCurrentOccupancy())
                .price(room.getPrice())
                .status(room.getStatus())
                .build();
    }
}
