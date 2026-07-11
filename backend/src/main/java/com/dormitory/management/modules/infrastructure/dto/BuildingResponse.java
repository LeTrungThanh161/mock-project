package com.dormitory.management.modules.infrastructure.dto;

import com.dormitory.management.constants.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuildingResponse {
    private Integer buildingId;
    private String name;
    private Gender genderType;
    private Byte totalFloors;
}
