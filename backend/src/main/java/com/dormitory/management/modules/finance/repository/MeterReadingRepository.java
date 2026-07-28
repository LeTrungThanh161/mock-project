package com.dormitory.management.modules.finance.repository;

import com.dormitory.management.modules.finance.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;


import java.time.LocalDate;
import java.util.Optional;
import java.util.List;


public interface MeterReadingRepository extends JpaRepository<MeterReading, Integer> {
    Optional<MeterReading> findByRoomRoomIdAndBillingMonth(Integer roomId, LocalDate billingMonth);
    List<MeterReading> findByBillingMonth(LocalDate billingMonth);
    
    // Tìm các bản ghi theo tòa nhà và tháng
    List<MeterReading> findByBuildingBuildingIdAndBillingMonth(Integer buildingId, LocalDate billingMonth);
}
