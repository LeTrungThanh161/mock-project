package com.dormitory.management.modules.contract.dto;

import lombok.Data;

@Data
public class RoomApplicationRequest {
    private Integer roomId;
    private String note;
}
