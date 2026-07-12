package com.dormitory.management.modules.contract.dto;

import com.dormitory.management.constants.Gender;
import com.dormitory.management.constants.StudentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Integer studentId;
    private String studentCode;
    private String fullName;
    private Gender gender;
    private String phoneNumber;
    private String className;
    private StudentStatus status;
}
