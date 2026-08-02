package com.dormitory.management.modules.auth.dto;

import com.dormitory.management.constants.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAccountResponse {
    private Integer studentId;
    private Integer accountId;
    private String studentCode;
    private String fullName;
    private String email;
    private String className;
    private String buildingName;
    private String roomNumber;
    private AccountStatus status;
}
