package com.dormitory.management.modules.contract.dto;

import com.dormitory.management.constants.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponse {
    private Integer contractId;
    private Integer studentId;
    private String studentName;
    private String studentCode;
    private Integer roomId;
    private String roomNumber;
    private Integer buildingId;
    private String buildingName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal deposit;
    private ContractStatus status;
    private Integer previousContractId;
    private Integer createdByStaffId;
    private LocalDateTime createdAt;
    private LocalDate actualCheckoutDate;
}
