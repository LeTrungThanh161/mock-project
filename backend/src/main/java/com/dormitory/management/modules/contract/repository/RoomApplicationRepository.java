package com.dormitory.management.modules.contract.repository;

import com.dormitory.management.constants.ApplicationStatus;
import com.dormitory.management.modules.contract.entity.RoomApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomApplicationRepository extends JpaRepository<RoomApplication, Integer> {
    
    List<RoomApplication> findByStudent_StudentId(Integer studentId);
    
    List<RoomApplication> findByBuilding_BuildingId(Integer buildingId);
    
    List<RoomApplication> findByStatus(ApplicationStatus status);
}
