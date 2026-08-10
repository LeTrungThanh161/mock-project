package com.dormitory.management.modules.contract.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TemporaryAbsenceRequest {
    private Integer contractId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
}
