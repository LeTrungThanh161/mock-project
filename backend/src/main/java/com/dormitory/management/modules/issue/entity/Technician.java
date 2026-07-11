package com.dormitory.management.modules.issue.entity;

import com.dormitory.management.constants.AccountStatus;
import com.dormitory.management.modules.infrastructure.entity.Building;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Technician")
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer technicianId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buildingId", nullable = false)
    private Building building;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 15)
    private String phoneNumber;

    /**
     * Trạng thái Active/Inactive — dùng chung AccountStatus enum
     * vì giá trị trùng khớp.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountStatus status;
}
