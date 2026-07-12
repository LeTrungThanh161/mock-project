package com.dormitory.management.modules.contract.dto;

import lombok.Data;

@Data
public class StudentUpdateRequest {
    private String fullName;
    private String phoneNumber;
    private String className;
}
