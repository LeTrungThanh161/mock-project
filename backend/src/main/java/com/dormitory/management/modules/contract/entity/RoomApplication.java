package com.dormitory.management.modules.contract.entity;

import com.dormitory.management.constants.ApplicationStatus;
import com.dormitory.management.modules.auth.entity.Staff;
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
@Table(name = "RoomApplication")
public class RoomApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer applicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studentId", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId", nullable = false)
    private Room room;

    /**
     * Đồng bộ tự động từ Room bằng trigger TRG_Application_SyncBuilding ở DB.
     * Phục vụ Row-Level Security (RLS).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buildingId", nullable = false)
    private Building building;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewedByStaffId")
    private Staff reviewedByStaff;

    private LocalDateTime reviewedAt;

    @Column(length = 300)
    private String rejectReason;
}
