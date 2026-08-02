package com.dormitory.management.modules.infrastructure.repository;

import com.dormitory.management.modules.infrastructure.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dormitory.management.constants.Gender;
import com.dormitory.management.constants.RoomStatus;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

        List<Room> findByBuilding_BuildingId(Integer buildingId);

        Optional<Room> findByBuilding_BuildingIdAndRoomNumber(Integer buildingId, String roomNumber);

        boolean existsByBuilding_BuildingIdAndRoomNumber(Integer buildingId, String roomNumber);

        @Query("SELECT DISTINCT r.floorNumber FROM Room r WHERE r.building.buildingId = :buildingId ORDER BY r.floorNumber")
        List<Integer> findDistinctFloorNumbersByBuildingId(@Param("buildingId") Integer buildingId);

        @Query("SELECT r FROM Room r " +
                        "JOIN FETCH r.building b " +
                        "LEFT JOIN FETCH r.roomType rt " +
                        "WHERE r.status = :status " +
                        "AND (b.genderType = :gender OR b.genderType = com.dormitory.management.constants.Gender.Mixed)")
        List<Room> findAvailableRoomsForGender(
                        @Param("gender") Gender gender,
                        @Param("status") RoomStatus status);
}
