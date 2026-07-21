package com.dormitory.management.modules.finance.entity;

import com.dormitory.management.modules.auth.entity.Staff;
import com.dormitory.management.modules.infrastructure.entity.Building;
import com.dormitory.management.modules.infrastructure.entity.Room;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "MeterReading", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"roomId", "billingMonth"})
})
public class MeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer readingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId", nullable = false)
    private Room room;

    /**
     * Đồng bộ tự động từ Room bằng trigger TRG_Reading_SyncBuilding ở DB.
     * Phục vụ Row-Level Security (RLS).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buildingId", nullable = false)
    private Building building;

    @Column(nullable = false)
    private LocalDate billingMonth;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal electricStart;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal electricEnd;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal waterStart;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal waterEnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recordedByStaffId")
    private Staff recordedByStaff;

    @Column(nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    @Transient
    private Boolean isFirstMonth;
}
