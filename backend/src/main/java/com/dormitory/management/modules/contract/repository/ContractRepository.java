package com.dormitory.management.modules.contract.repository;

import com.dormitory.management.constants.ContractStatus;
import com.dormitory.management.modules.contract.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Integer> {

    List<Contract> findByStudent_StudentId(Integer studentId);

    List<Contract> findByBuilding_BuildingId(Integer buildingId);

    List<Contract> findByStatus(ContractStatus status);

    List<Contract> findByRoom_RoomIdAndStatusOrderByCreatedAtDesc(Integer roomId, ContractStatus status);
}
