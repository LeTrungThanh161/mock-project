package com.dormitory.management.modules.infrastructure.dto;

import com.dormitory.management.constants.RoomStatus;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class RoomRequest {
    private Integer buildingId;
    private Integer roomTypeId;
    private String roomNumber;
    private Byte maxCapacity;
    private BigDecimal price;
    private RoomStatus status;
}
