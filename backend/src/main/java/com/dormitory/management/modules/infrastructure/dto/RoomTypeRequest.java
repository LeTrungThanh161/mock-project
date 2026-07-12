package com.dormitory.management.modules.infrastructure.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RoomTypeRequest {
    private String typeName;
    private Byte defaultCapacity;
    private BigDecimal defaultPrice;
}
