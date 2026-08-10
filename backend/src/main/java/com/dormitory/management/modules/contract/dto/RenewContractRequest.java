package com.dormitory.management.modules.contract.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RenewContractRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal deposit;
}
