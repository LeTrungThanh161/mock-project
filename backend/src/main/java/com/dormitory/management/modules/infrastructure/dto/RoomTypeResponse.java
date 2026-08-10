package com.dormitory.management.modules.infrastructure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {
    private Integer roomTypeId;
    private String typeName;
    private Byte defaultCapacity;
    private BigDecimal defaultPrice;
}
