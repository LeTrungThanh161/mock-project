package com.dormitory.management.modules.infrastructure.dto;

import com.dormitory.management.constants.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Integer roomId;
    private Integer buildingId;
    private String buildingName;
    private Integer roomTypeId;
    private String roomTypeName;
    private String roomNumber;
    private Byte floorNumber;
    private Byte maxCapacity;
    private Byte currentOccupancy;
    private BigDecimal price;
    private RoomStatus status;
}
