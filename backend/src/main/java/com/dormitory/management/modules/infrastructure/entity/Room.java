package com.dormitory.management.modules.infrastructure.entity;

import com.dormitory.management.constants.RoomStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Room")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buildingId", nullable = false)
    private Building building;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomTypeId")
    private RoomType roomType;

    @Column(nullable = false, length = 10)
    private String roomNumber;

    /**
     * Computed column (PERSISTED) trong DB - tự tính từ RoomNumber.
     * VD: '101' -> 1, '205' -> 2, '1201' -> 12
     * Chỉ đọc từ phía Java, không insert/update.
     */
    @Column(insertable = false, updatable = false)
    private Byte floorNumber;

    @Column(nullable = false)
    private Byte maxCapacity;

    @Column(nullable = false)
    private Byte currentOccupancy;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status;
}
