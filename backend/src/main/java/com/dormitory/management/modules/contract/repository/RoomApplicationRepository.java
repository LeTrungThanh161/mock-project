package com.dormitory.management.modules.contract.repository;

import com.dormitory.management.constants.ApplicationStatus;
import com.dormitory.management.modules.contract.entity.RoomApplication;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;


public interface RoomApplicationRepository extends JpaRepository<RoomApplication, Integer> {
    
    List<RoomApplication> findByStudent_StudentId(Integer studentId);
    
    List<RoomApplication> findByBuilding_BuildingId(Integer buildingId);
    
    List<RoomApplication> findByStatus(ApplicationStatus status);
}
