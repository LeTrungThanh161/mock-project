package com.dormitory.management.modules.auth.entity;

import com.dormitory.management.modules.infrastructure.entity.Building;
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
@Table(name = "Staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer staffId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accountId", nullable = false, unique = true)
    private Account account;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 15)
    private String phoneNumber;

    @Column(length = 100)
    private String position;

    /**
     * NULL = Admin (quản lý toàn hệ thống)
     * Có giá trị = Manager của tòa nhà đó
     * Ràng buộc: 1 tòa nhà chỉ có tối đa 1 Manager (filtered unique index ở DB)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buildingId")
    private Building building;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
