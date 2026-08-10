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
public class InvoiceResponse {
    private Integer invoiceId;
    private Integer roomId;
    private String roomNumber;
    private String buildingName;
    private LocalDate billingMonth;
    private BigDecimal roomFee;
    private BigDecimal electricityFee;
    private BigDecimal waterFee;
    private BigDecimal internetFee;
    private BigDecimal totalAmount;
    private LocalDate dueDate;
    private String paymentStatus;
    private String paymentMethod;
    private String invoiceType;
    private String invoiceTypeLabel;
    private String statusLabel;
    private Integer overdueDays;
    private BigDecimal penaltyAmount;
    private Boolean canPay;
    private String paymentCheckoutUrl;
    private String paymentCounterpartCode;
    private Integer contractId;
}
