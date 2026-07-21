package com.dormitory.management.modules.finance.service;

import com.dormitory.management.modules.finance.dto.MeterReadingResponse;
import com.dormitory.management.modules.finance.dto.MeterReadingBulkUpdateRequest;
import com.dormitory.management.modules.finance.entity.MeterReading;
import com.dormitory.management.modules.finance.repository.MeterReadingRepository;
import com.dormitory.management.modules.infrastructure.entity.Building;
import com.dormitory.management.modules.infrastructure.entity.Room;
import com.dormitory.management.modules.infrastructure.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MeterReadingService {

    private final MeterReadingRepository meterReadingRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public List<MeterReadingResponse> getOrGenerateMeterReadings(Integer buildingId, Integer floorNumber, LocalDate month) {
        // Fetch rooms for this building and floor
        List<Room> rooms = roomRepository.findByBuilding_BuildingId(buildingId);
        if (floorNumber != null) {
            rooms = rooms.stream().filter(r -> r.getFloorNumber().equals(floorNumber.byteValue())).toList();
        }

        List<MeterReading> currentMonthReadings = meterReadingRepository.findByBuildingBuildingIdAndBillingMonth(buildingId, month);
        List<MeterReading> result = new ArrayList<>(currentMonthReadings);
        boolean generatedNew = false;

        for (Room room : rooms) {
            boolean exists = currentMonthReadings.stream().anyMatch(r -> r.getRoom().getRoomId().equals(room.getRoomId()));
            if (!exists) {
                // Generate new reading based on last month
                LocalDate lastMonth = month.minusMonths(1);
                Optional<MeterReading> lastReadingOpt = meterReadingRepository.findByRoomRoomIdAndBillingMonth(room.getRoomId(), lastMonth);

                BigDecimal startElectric = BigDecimal.ZERO;
                BigDecimal startWater = BigDecimal.ZERO;

                if (lastReadingOpt.isPresent()) {
                    MeterReading lastReading = lastReadingOpt.get();
                    startElectric = lastReading.getElectricEnd() != null ? lastReading.getElectricEnd() : lastReading.getElectricStart();
                    startWater = lastReading.getWaterEnd() != null ? lastReading.getWaterEnd() : lastReading.getWaterStart();
                } // Else defaults to ZERO (e.g. July 2026)

                MeterReading newReading = MeterReading.builder()
                        .room(room)
                        .building(room.getBuilding())
                        .billingMonth(month)
                        .electricStart(startElectric)
                        .electricEnd(startElectric) // Default End = Start
                        .waterStart(startWater)
                        .waterEnd(startWater) // Default End = Start
                        .recordedAt(LocalDateTime.now())
                        .build();
                newReading.setIsFirstMonth(!lastReadingOpt.isPresent());

                meterReadingRepository.save(newReading);
                result.add(newReading);
                generatedNew = true;
            }
        }
        
        return result.stream()
                .filter(r -> floorNumber == null || r.getRoom().getFloorNumber().equals(floorNumber.byteValue()))
                .map(r -> {
                    LocalDate lastMonth = month.minusMonths(1);
                    boolean hasLastMonth = meterReadingRepository.findByRoomRoomIdAndBillingMonth(r.getRoom().getRoomId(), lastMonth).isPresent();
                    return com.dormitory.management.modules.finance.dto.MeterReadingResponse.builder()
                            .readingId(r.getReadingId())
                            .room(com.dormitory.management.modules.finance.dto.MeterReadingResponse.RoomDto.builder()
                                    .roomId(r.getRoom().getRoomId())
                                    .roomNumber(r.getRoom().getRoomNumber())
                                    .build())
                            .billingMonth(r.getBillingMonth())
                            .electricStart(r.getElectricStart())
                            .electricEnd(r.getElectricEnd())
                            .waterStart(r.getWaterStart())
                            .waterEnd(r.getWaterEnd())
                            .isFirstMonth(!hasLastMonth)
                            .build();
                })
                .toList();
    }

    @Transactional
    public void bulkUpdateReadings(List<MeterReadingBulkUpdateRequest> requests) {
        for (MeterReadingBulkUpdateRequest req : requests) {
            meterReadingRepository.findById(req.getReadingId()).ifPresent(reading -> {
                if (req.getElectricStart() != null) {
                    reading.setElectricStart(req.getElectricStart());
                }
                if (req.getWaterStart() != null) {
                    reading.setWaterStart(req.getWaterStart());
                }
                if (req.getElectricEnd() != null) {
                    reading.setElectricEnd(req.getElectricEnd());
                }
                if (req.getWaterEnd() != null) {
                    reading.setWaterEnd(req.getWaterEnd());
                }
                meterReadingRepository.save(reading);
            });
        }
    }
}
