package com.dormitory.management.modules.finance.controller;

import com.dormitory.management.modules.finance.entity.PricingTier;
import com.dormitory.management.modules.finance.repository.PricingTierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pricing-tiers")
@RequiredArgsConstructor
public class PricingTierController {

    private final PricingTierRepository pricingTierRepository;

    @GetMapping
    public ResponseEntity<List<PricingTier>> getAllPricingTiers() {
        return ResponseEntity.ok(pricingTierRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<PricingTier> createPricingTier(@RequestBody PricingTier tier) {
        return ResponseEntity.ok(pricingTierRepository.save(tier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PricingTier> updatePricingTier(@PathVariable Integer id, @RequestBody PricingTier tierDetails) {
        return pricingTierRepository.findById(id)
                .map(existingTier -> {
                    existingTier.setUtilityType(tierDetails.getUtilityType());
                    existingTier.setTierOrder(tierDetails.getTierOrder());
                    existingTier.setFromUnit(tierDetails.getFromUnit());
                    existingTier.setToUnit(tierDetails.getToUnit());
                    existingTier.setUnitPrice(tierDetails.getUnitPrice());
                    return ResponseEntity.ok(pricingTierRepository.save(existingTier));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePricingTier(@PathVariable Integer id) {
        return pricingTierRepository.findById(id)
                .map(existingTier -> {
                    pricingTierRepository.delete(existingTier);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
