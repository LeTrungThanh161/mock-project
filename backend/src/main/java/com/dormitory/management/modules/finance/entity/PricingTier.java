package com.dormitory.management.modules.finance.entity;

import com.dormitory.management.constants.UtilityType;
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
@Table(name = "PricingTier", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"utilityType", "tierOrder"})
})
public class PricingTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer tierId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UtilityType utilityType;

    @Column(nullable = false)
    private Byte tierOrder;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fromUnit;

    /**
     * NULL = bậc cao nhất, không giới hạn trần.
     */
    @Column(precision = 10, scale = 2)
    private BigDecimal toUnit;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;
}
