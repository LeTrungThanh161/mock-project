package com.dormitory.management.modules.contract.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResult {
    private String message;
    private Integer contractId;
    private Integer invoiceId;
    private String paymentUrl;
}
