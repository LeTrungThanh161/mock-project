package com.dormitory.management.modules.auth.dto;

import com.dormitory.management.constants.AccountStatus;
import lombok.Data;

@Data
public class UpdateStaffRequest {
    private String fullName;
    private String phoneNumber;
    private Integer buildingId;
    private AccountStatus status;
}
