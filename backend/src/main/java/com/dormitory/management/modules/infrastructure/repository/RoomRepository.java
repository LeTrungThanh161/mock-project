package com.dormitory.management.modules.infrastructure.repository;

import com.dormitory.management.modules.infrastructure.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    
    List<Room> findByBuilding_BuildingId(Integer buildingId);
    
    Optional<Room> findByBuilding_BuildingIdAndRoomNumber(Integer buildingId, String roomNumber);
    
    boolean existsByBuilding_BuildingIdAndRoomNumber(Integer buildingId, String roomNumber);
}
