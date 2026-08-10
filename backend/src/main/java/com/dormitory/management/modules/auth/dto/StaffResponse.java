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
public class StaffResponse {
    private Integer staffId;
    private Integer accountId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String roleName;
    private Integer buildingId;
    private String buildingName;
    private AccountStatus status;
}
