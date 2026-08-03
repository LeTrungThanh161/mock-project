package com.dormitory.management.modules.auth.dto;

import lombok.Data;

@Data
public class CreateManagerRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String password;
    private Integer buildingId;
}
