package com.dormitory.management.modules.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyReport {
    private long totalRooms;
    private long occupiedRooms;
    private long availableRooms;
    private double occupancyRate;
}
