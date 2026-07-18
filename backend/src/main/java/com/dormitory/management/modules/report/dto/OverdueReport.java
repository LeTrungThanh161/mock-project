package com.dormitory.management.modules.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverdueReport {
    private int invoiceId;
    private String roomName;
    private String buildingName;
    private BigDecimal amountDue;
    private long daysOverdue;
}
