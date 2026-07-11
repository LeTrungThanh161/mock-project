package com.dormitory.management.modules.finance.entity;

import com.dormitory.management.constants.PaymentStatus;
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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Invoice", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"roomId", "billingMonth"})
})
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId", nullable = false)
    private Room room;

    /**
     * Đồng bộ tự động từ Room bằng trigger TRG_Invoice_SyncBuilding ở DB.
     * Phục vụ Row-Level Security (RLS).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buildingId", nullable = false)
    private Building building;

    @Column(nullable = false)
    private LocalDate billingMonth;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal roomFee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal electricityFee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal waterFee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal internetFee;

    /**
     * Computed column (PERSISTED) trong DB: RoomFee + ElectricityFee + WaterFee + InternetFee.
     * Chỉ đọc từ phía Java, không insert/update.
     */
    @Column(insertable = false, updatable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(length = 20)
    private String paymentMethod;

    @Column(length = 100)
    private String transactionRef;

    private LocalDate paymentDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generatedByStaffId")
    private Staff generatedByStaff;
}
