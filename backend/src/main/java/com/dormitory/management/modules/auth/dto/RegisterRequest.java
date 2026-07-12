package com.dormitory.management.modules.auth.dto;

import com.dormitory.management.constants.Gender;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String studentCode;
    private String fullName;
    private Gender gender;
    private String phoneNumber;
    private String className;
}
