package com.dormitory.management.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeResponse {
    private Integer accountId;
    private String email;
    private String role;
    private Integer buildingId;   // null nếu Admin hoặc Student
    private String fullName;
}
