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
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.constants.RoomStatus;
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
    private final StudentRepository studentRepository;

    public List<RoomResponse> getAllRooms(Integer buildingId, Byte floorNumber) {
        List<Room> rooms;
        if (buildingId != null && floorNumber != null) {
            rooms = roomRepository.findByBuilding_BuildingIdAndFloorNumber(buildingId, floorNumber);
        } else if (buildingId != null) {
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

        // Validate format số phòng: chỉ chứa chữ số, tối thiểu 3 ký tự
        String roomNumber = request.getRoomNumber();
        if (roomNumber == null || !roomNumber.matches("^\\d{3,}$")) {
            throw new IllegalArgumentException(
                    "Số phòng chỉ được chứa chữ số và phải có ít nhất 3 ký tự (VD: 101, 205, 1201).");
        }

        // Validate tầng theo logic computed column DB: floorNumber = roomNumber / 100
        int floorFromRoomNumber = Integer.parseInt(roomNumber) / 100;
        if (floorFromRoomNumber < 1) {
            throw new IllegalArgumentException(
                    "Số phòng không hợp lệ: 2 chữ số cuối là số phòng trong tầng, các chữ số còn lại là số tầng (tầng phải ≥ 1).");
        }
        if (floorFromRoomNumber > building.getTotalFloors()) {
            throw new IllegalArgumentException(
                    "Số phòng thuộc tầng " + floorFromRoomNumber
                    + " nhưng tòa nhà \"" + building.getName() + "\" chỉ có " + building.getTotalFloors() + " tầng.");
        }

        if (roomRepository.existsByBuilding_BuildingIdAndRoomNumber(request.getBuildingId(), request.getRoomNumber())) {
            throw new IllegalArgumentException("Room number already exists in this building");
        }

        Room room = Room.builder()
                .building(building)
                .roomType(roomType)
                .roomNumber(request.getRoomNumber())
                .maxCapacity(request.getMaxCapacity() != null ? request.getMaxCapacity()
                        : (roomType != null ? roomType.getDefaultCapacity() : 0))
                .currentOccupancy((byte) 0)
                // Giá phòng luôn lấy theo giá mặc định của loại phòng
                .price(roomType != null ? roomType.getDefaultPrice() : request.getPrice())
                .status(request.getStatus() != null ? request.getStatus() : RoomStatus.Available)
                .build();

        Room savedRoom = roomRepository.save(room);

        // Cần fetch lại để DB tính toán floorNumber (computed column PERSISTED). Mặc dù
        // Hibernate không tự lấy computed column về trừ khi Refresh/Find lại.
        return mapToResponse(savedRoom);
    }

    @Transactional
    public RoomResponse updateRoom(Integer id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + id));

        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new IllegalArgumentException("Building not found"));

        // Validate format số phòng: chỉ chứa chữ số, tối thiểu 3 ký tự
        String roomNumber = request.getRoomNumber();
        if (roomNumber == null || !roomNumber.matches("^\\d{3,}$")) {
            throw new IllegalArgumentException(
                    "Số phòng chỉ được chứa chữ số và phải có ít nhất 3 ký tự (VD: 101, 205, 1201).");
        }

        // Validate tầng theo logic computed column DB: floorNumber = roomNumber / 100
        int floorFromRoomNumber = Integer.parseInt(roomNumber) / 100;
        if (floorFromRoomNumber < 1) {
            throw new IllegalArgumentException(
                    "Số phòng không hợp lệ: 2 chữ số cuối là số phòng trong tầng, các chữ số còn lại là số tầng (tầng phải ≥ 1).");
        }
        if (floorFromRoomNumber > building.getTotalFloors()) {
            throw new IllegalArgumentException(
                    "Số phòng thuộc tầng " + floorFromRoomNumber
                    + " nhưng tòa nhà \"" + building.getName() + "\" chỉ có " + building.getTotalFloors() + " tầng.");
        }

        // Nếu thay đổi Building hoặc RoomNumber, check xem có bị trùng không
        if (!room.getBuilding().getBuildingId().equals(request.getBuildingId())
                || !room.getRoomNumber().equals(request.getRoomNumber())) {
            if (roomRepository.existsByBuilding_BuildingIdAndRoomNumber(request.getBuildingId(),
                    request.getRoomNumber())) {
                throw new IllegalArgumentException("Room number already exists in this building");
            }
        }

        RoomType roomType = null;
        if (request.getRoomTypeId() != null) {
            roomType = roomTypeRepository.findById(request.getRoomTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("RoomType not found"));
        }

        room.setBuilding(building);
        room.setRoomType(roomType);
        room.setRoomNumber(request.getRoomNumber());
        room.setMaxCapacity(request.getMaxCapacity());
        // Giá phòng luôn lấy theo giá mặc định của loại phòng
        room.setPrice(roomType != null ? roomType.getDefaultPrice() : request.getPrice());

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

    public List<Byte> getDistinctFloorNumbers(Integer buildingId) {
        return roomRepository.findDistinctFloorNumbersByBuildingId(buildingId);
    }

    @Transactional(readOnly = true)
    public List<com.dormitory.management.modules.contract.dto.AvailableRoomDTO> getAvailableRoomsForStudent(
            Integer accountId) {
        Student student = studentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        List<Room> availableRooms = roomRepository.findAvailableRoomsForGender(
                student.getGender(), RoomStatus.Available);

        return availableRooms.stream()
                .map(room -> com.dormitory.management.modules.contract.dto.AvailableRoomDTO.builder()
                        .roomId(room.getRoomId())
                        .roomNumber(room.getRoomNumber())
                        .buildingName(room.getBuilding().getName())
                        .roomTypeName(room.getRoomType().getTypeName())
                        .currentOccupancy(room.getCurrentOccupancy())
                        .maxCapacity(room.getMaxCapacity())
                        .price(room.getPrice())
                        .build())
                .collect(Collectors.toList());
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
