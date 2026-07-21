package com.dormitory.management.modules.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeterReadingResponse {
    private Integer readingId;
    private RoomDto room;
    private LocalDate billingMonth;
    private BigDecimal electricStart;
    private BigDecimal electricEnd;
    private BigDecimal waterStart;
    private BigDecimal waterEnd;
    private Boolean isFirstMonth;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomDto {
        private Integer roomId;
        private String roomNumber;
    }
}
