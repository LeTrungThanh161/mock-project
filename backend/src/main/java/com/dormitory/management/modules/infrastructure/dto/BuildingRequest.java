package com.dormitory.management.modules.infrastructure.dto;

import com.dormitory.management.constants.Gender;
import lombok.Data;

@Data
public class BuildingRequest {
    private String name;
    private Gender genderType;
    private Byte totalFloors;
}
