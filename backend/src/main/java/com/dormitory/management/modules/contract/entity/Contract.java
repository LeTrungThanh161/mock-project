package com.dormitory.management.modules.contract.entity;

import com.dormitory.management.constants.ContractStatus;
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
@Table(name = "Contract")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studentId", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId", nullable = false)
    private Room room;

    /**
     * Đồng bộ tự động từ Room bằng trigger TRG_Contract_SyncBuilding ở DB.
     * Phục vụ Row-Level Security (RLS).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buildingId", nullable = false)
    private Building building;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal deposit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContractStatus status;

    /**
     * Trỏ về hợp đồng cũ nếu đây là hợp đồng gia hạn (sp_RenewContract).
     * NULL nếu là hợp đồng gốc.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previousContractId")
    private Contract previousContract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createdByStaffId")
    private Staff createdByStaff;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
