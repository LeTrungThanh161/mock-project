package com.dormitory.management.modules.infrastructure.entity;

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
@Table(name = "RoomType")
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roomTypeId;

    @Column(nullable = false, unique = true, length = 50)
    private String typeName;

    @Column(nullable = false)
    private Byte defaultCapacity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal defaultPrice;
}
