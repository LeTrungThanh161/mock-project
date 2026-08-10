package com.dormitory.management.modules.finance.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MeterReadingBulkUpdateRequest {
    private Integer readingId;
    private BigDecimal electricStart;
    private BigDecimal electricEnd;
    private BigDecimal waterStart;
    private BigDecimal waterEnd;
}
