package com.dormitory.management.modules.issue.repository;

import com.dormitory.management.modules.issue.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Integer> {
    List<Technician> findByBuildingBuildingId(Integer buildingId);
}
