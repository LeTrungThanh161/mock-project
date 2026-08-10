package com.dormitory.management.modules.contract.dto;

import com.dormitory.management.constants.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomApplicationResponse {
    private Integer applicationId;
    private Integer studentId;
    private String studentName;
    private String studentCode;
    private Integer roomId;
    private String roomNumber;
    private Integer buildingId;
    private String buildingName;
    private ApplicationStatus status;
    private String note;
    private LocalDateTime submittedAt;
    private String rejectReason;
    private Integer reviewedByStaffId;
    private LocalDateTime reviewedAt;
}
