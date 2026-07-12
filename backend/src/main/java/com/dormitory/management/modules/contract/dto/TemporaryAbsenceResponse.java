package com.dormitory.management.modules.contract.dto;

import com.dormitory.management.constants.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemporaryAbsenceResponse {
    private Integer absenceId;
    private Integer studentId;
    private String studentName;
    private Integer contractId;
    private String roomNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private ApplicationStatus status;
    private LocalDateTime createdAt;
}
