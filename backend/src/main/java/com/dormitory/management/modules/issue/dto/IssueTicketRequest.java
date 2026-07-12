package com.dormitory.management.modules.issue.dto;

import com.dormitory.management.constants.TicketPriority;
import lombok.Data;

@Data
public class IssueTicketRequest {
    private Integer roomId;
    private Integer studentId;
    private Integer buildingId;
    private String description;
    private TicketPriority priority;
}
