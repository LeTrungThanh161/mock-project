package com.dormitory.management.modules.contract.repository;

import com.dormitory.management.constants.ContractStatus;
import com.dormitory.management.modules.contract.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {
    
    List<Contract> findByStudent_StudentId(Integer studentId);
    
    List<Contract> findByBuilding_BuildingId(Integer buildingId);
    
    List<Contract> findByStatus(ContractStatus status);
}
