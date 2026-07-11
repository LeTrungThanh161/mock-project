package com.dormitory.management.modules.issue.entity;

import com.dormitory.management.constants.TicketPriority;
import com.dormitory.management.constants.TicketStatus;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.infrastructure.entity.Building;
import com.dormitory.management.modules.infrastructure.entity.Room;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "IssueTicket")
public class IssueTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ticketId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId", nullable = false)
    private Room room;

    /**
     * Đồng bộ tự động từ Room bằng trigger TRG_Ticket_SyncBuilding ở DB.
     * Phục vụ Row-Level Security (RLS).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buildingId", nullable = false)
    private Building building;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studentId", nullable = false)
    private Student student;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(length = 255)
    private String imagePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignedTechnicianId")
    private Technician assignedTechnician;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Tự động ghi bởi trigger TRG_Ticket_LogStatusChange khi status = 'Completed'.
     */
    private LocalDateTime resolvedAt;
}
