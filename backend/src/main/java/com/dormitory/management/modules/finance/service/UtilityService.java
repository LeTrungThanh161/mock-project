package com.dormitory.management.modules.finance.service;

import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.constants.UtilityType;
import com.dormitory.management.modules.auth.entity.Staff;
import com.dormitory.management.modules.finance.entity.Invoice;
import com.dormitory.management.modules.finance.entity.MeterReading;
import com.dormitory.management.modules.finance.entity.PricingTier;
import com.dormitory.management.modules.finance.repository.InvoiceRepository;
import com.dormitory.management.modules.finance.repository.MeterReadingRepository;
import com.dormitory.management.modules.finance.repository.PricingTierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilityService {

    private final MeterReadingRepository meterReadingRepository;
    private final PricingTierRepository pricingTierRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public MeterReading saveMeterReading(MeterReading reading) {
        return meterReadingRepository.save(reading);
    }

    @Transactional
    public void generateInvoicesForMonth(LocalDate billingMonth, Integer staffId) {
        List<MeterReading> readings = meterReadingRepository.findByBillingMonth(billingMonth);
        List<PricingTier> electricTiers = pricingTierRepository.findByUtilityTypeOrderByTierOrderAsc(UtilityType.Electric);
        List<PricingTier> waterTiers = pricingTierRepository.findByUtilityTypeOrderByTierOrderAsc(UtilityType.Water);

        Staff staff = new Staff();
        staff.setStaffId(staffId);

        for (MeterReading reading : readings) {
            BigDecimal electricUsage = reading.getElectricEnd().subtract(reading.getElectricStart());
            BigDecimal waterUsage = reading.getWaterEnd().subtract(reading.getWaterStart());

            BigDecimal electricFee = calculateProgressiveFee(electricUsage, electricTiers);
            BigDecimal waterFee = calculateProgressiveFee(waterUsage, waterTiers);
            
            // For demo purpose, roomFee and internetFee are fixed or fetched from Contract/Room
            BigDecimal roomFee = BigDecimal.valueOf(1500000); 
            BigDecimal internetFee = BigDecimal.valueOf(100000);

            Invoice invoice = Invoice.builder()
                    .room(reading.getRoom())
                    .building(reading.getBuilding())
                    .billingMonth(billingMonth)
                    .roomFee(roomFee)
                    .electricityFee(electricFee)
                    .waterFee(waterFee)
                    .internetFee(internetFee)
                    .dueDate(billingMonth.plusMonths(1).withDayOfMonth(5))
                    .paymentStatus(PaymentStatus.Unpaid)
                    .generatedByStaff(staff)
                    .build();

            invoiceRepository.save(invoice);
        }
    }

    private BigDecimal calculateProgressiveFee(BigDecimal usage, List<PricingTier> tiers) {
        BigDecimal totalFee = BigDecimal.ZERO;
        BigDecimal remainingUsage = usage;

        for (PricingTier tier : tiers) {
            if (remainingUsage.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal tierMaxUsage = tier.getToUnit() != null ? 
                    tier.getToUnit().subtract(tier.getFromUnit()).add(BigDecimal.ONE) : 
                    remainingUsage; // If toUnit is null, it means no upper bound

            BigDecimal usageInTier = remainingUsage.min(tierMaxUsage);
            totalFee = totalFee.add(usageInTier.multiply(tier.getUnitPrice()));
            remainingUsage = remainingUsage.subtract(usageInTier);
        }

        return totalFee;
    }

    @Transactional(readOnly = true)
    public List<MeterReading> getAllMeterReadings() {
        return meterReadingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }
}
