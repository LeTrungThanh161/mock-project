package com.dormitory.management.modules.finance.repository;

import com.dormitory.management.constants.UtilityType;
import com.dormitory.management.modules.finance.entity.PricingTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PricingTierRepository extends JpaRepository<PricingTier, Integer> {
    List<PricingTier> findByUtilityTypeOrderByTierOrderAsc(UtilityType utilityType);
}
