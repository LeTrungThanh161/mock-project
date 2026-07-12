package com.dormitory.management.modules.report.dto;

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
public class RevenueReport {
    private LocalDate month;
    private BigDecimal expectedRevenue;
    private BigDecimal actualRevenue;
}
