package com.dormitory.management.modules.contract.repository;

import com.dormitory.management.constants.ContractStatus;
import com.dormitory.management.modules.contract.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Integer> {

    List<Contract> findByStudent_StudentId(Integer studentId);

    List<Contract> findByBuilding_BuildingId(Integer buildingId);

    List<Contract> findByStatus(ContractStatus status);

    @Query("select c from Contract c where c.room.roomId = :roomId and c.status = :status order by c.createdAt desc")
    List<Contract> findByRoom_RoomIdAndStatusOrderByCreatedAtDesc(@Param("roomId") Integer roomId,
                                                                  @Param("status") ContractStatus status);
    List<Contract> findByBuilding_BuildingIdAndStatus(Integer buildingId, ContractStatus status);
}
