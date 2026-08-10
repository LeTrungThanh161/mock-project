package com.dormitory.management.modules.contract.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableRoomDTO {
    private Integer roomId;
    private String roomNumber;
    private String buildingName;
    private String roomTypeName;
    private Byte currentOccupancy;
    private Byte maxCapacity;
    private BigDecimal price;
}
