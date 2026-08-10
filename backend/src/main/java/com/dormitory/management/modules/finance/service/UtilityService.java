package com.dormitory.management.modules.finance.service;

import com.dormitory.management.constants.ContractStatus;
import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.constants.UtilityType;
import com.dormitory.management.modules.auth.entity.Staff;
import com.dormitory.management.modules.auth.repository.StaffRepository;
import com.dormitory.management.modules.contract.entity.Contract;
import com.dormitory.management.modules.contract.repository.ContractRepository;
import com.dormitory.management.modules.finance.entity.Invoice;
import com.dormitory.management.modules.finance.entity.MeterReading;
import com.dormitory.management.modules.finance.entity.PricingTier;
import com.dormitory.management.modules.finance.repository.InvoiceRepository;
import com.dormitory.management.modules.finance.repository.MeterReadingRepository;
import com.dormitory.management.modules.finance.repository.PricingTierRepository;
import com.dormitory.management.modules.infrastructure.entity.Room;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilityService {

    private static final Logger log = LoggerFactory.getLogger(UtilityService.class);
    private final StaffRepository staffRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final PricingTierRepository pricingTierRepository;
    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;

    @Transactional
    public MeterReading saveMeterReading(MeterReading reading) {
        return meterReadingRepository.save(reading);
    }

    /**
     * Xuất hóa đơn tháng cho toàn bộ sinh viên (Contract Active) của 1 tòa.
     * - Tiền phòng: mỗi SV đóng full giá phòng
     * - Điện + Nước: tính cả phòng rồi chia đều theo số người đang ở
     * - Internet: = 0
     * - Chỉ tạo nếu đã có chỉ số điện nước và chưa có hóa đơn ROOM_FEE tháng đó
     *
     * @return số hóa đơn đã tạo
     */

   @Transactional
public int exportInvoicesForBuilding(Integer buildingId, LocalDate billingMonth, Integer accountId) {
    List<Contract> contracts = contractRepository
            .findByBuilding_BuildingIdAndStatus(buildingId, ContractStatus.Active);

    if (contracts.isEmpty()) {
        log.info("Tòa {} không có Contract Active nào", buildingId);
        return 0;
    }

    List<MeterReading> readings = meterReadingRepository
            .findByBuildingBuildingIdAndBillingMonth(buildingId, billingMonth);

    Map<Integer, MeterReading> readingByRoom = readings.stream()
            .collect(Collectors.toMap(
                    r -> r.getRoom().getRoomId(),
                    r -> r,
                    (a, b) -> a
            ));

    // === SỬA CHỖ NÀY ===
    Staff staff = null;
    if (accountId != null) {
        staff = staffRepository.findByAccountId(accountId).orElse(null);
        if (staff == null) {
            log.warn("Không tìm thấy Staff với AccountId = {} → generatedByStaff = null", accountId);
        }
    }

    List<PricingTier> electricTiers = pricingTierRepository
            .findByUtilityTypeOrderByTierOrderAsc(UtilityType.Electric);
    List<PricingTier> waterTiers = pricingTierRepository
            .findByUtilityTypeOrderByTierOrderAsc(UtilityType.Water);

    int created = 0;

    for (Contract contract : contracts) {
        Room room = contract.getRoom();
        if (room == null || room.getRoomId() == null) {
            continue;
        }

        boolean exists = invoiceRepository
                .existsByContract_ContractIdAndInvoiceTypeAndBillingMonth(
                        contract.getContractId(), "ROOM_FEE", billingMonth);
        if (exists) {
            log.debug("Contract {} đã có hóa đơn ROOM_FEE tháng {} → bỏ qua",
                    contract.getContractId(), billingMonth);
            continue;
        }

        MeterReading reading = readingByRoom.get(room.getRoomId());
        if (reading == null) {
            log.warn("Phòng {} chưa có chỉ số điện nước tháng {} → bỏ qua",
                    room.getRoomNumber(), billingMonth);
            continue;
        }

        int occupancy = (room.getCurrentOccupancy() != null && room.getCurrentOccupancy() > 0)
                ? room.getCurrentOccupancy()
                : 1;

        BigDecimal electricUsage = safeSubtract(reading.getElectricEnd(), reading.getElectricStart());
        BigDecimal waterUsage = safeSubtract(reading.getWaterEnd(), reading.getWaterStart());

        BigDecimal electricFeeRoom = calculateProgressiveFee(electricUsage, electricTiers);
        BigDecimal waterFeeRoom = calculateProgressiveFee(waterUsage, waterTiers);

        BigDecimal electricFee = electricFeeRoom
                .divide(BigDecimal.valueOf(occupancy), 0, RoundingMode.HALF_UP);
        BigDecimal waterFee = waterFeeRoom
                .divide(BigDecimal.valueOf(occupancy), 0, RoundingMode.HALF_UP);

        BigDecimal roomFee = room.getPrice() != null ? room.getPrice() : BigDecimal.ZERO;

        Invoice invoice = Invoice.builder()
                .room(room)
                .building(room.getBuilding())
                .contract(contract)
                .billingMonth(billingMonth)
                .roomFee(roomFee)
                .electricityFee(electricFee)
                .waterFee(waterFee)
                .internetFee(BigDecimal.ZERO)
                .dueDate(billingMonth.plusMonths(1).withDayOfMonth(10))
                .paymentStatus(PaymentStatus.Unpaid)
                .invoiceType("ROOM_FEE")
                .generatedByStaff(staff)          // dùng Staff đã map từ AccountId
                .build();

        invoice = invoiceRepository.save(invoice);
        invoice.setOrderCode(generateOrderCode(invoice.getInvoiceId()));
        invoice.setPaymentCounterpartCode("KTX_PHONG_" + invoice.getInvoiceId());
        invoiceRepository.save(invoice);

        created++;
        log.info("Đã tạo hóa đơn ROOM_FEE id={} cho Contract {}, phòng {}, tháng {}",
                invoice.getInvoiceId(), contract.getContractId(),
                room.getRoomNumber(), billingMonth);
    }

    log.info("Xuất hóa đơn tòa {} tháng {}: tạo {} hóa đơn", buildingId, billingMonth, created);
    return created;
}
    private BigDecimal safeSubtract(BigDecimal end, BigDecimal start) {
        if (end == null || start == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal diff = end.subtract(start);
        return diff.signum() < 0 ? BigDecimal.ZERO : diff;
    }

    private BigDecimal calculateProgressiveFee(BigDecimal usage, List<PricingTier> tiers) {
        if (usage == null || usage.compareTo(BigDecimal.ZERO) <= 0 || tiers == null || tiers.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalFee = BigDecimal.ZERO;
        BigDecimal remainingUsage = usage;

        for (PricingTier tier : tiers) {
            if (remainingUsage.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal tierMaxUsage = tier.getToUnit() != null
                    ? tier.getToUnit().subtract(tier.getFromUnit()).add(BigDecimal.ONE)
                    : remainingUsage;

            BigDecimal usageInTier = remainingUsage.min(tierMaxUsage);
            totalFee = totalFee.add(usageInTier.multiply(tier.getUnitPrice()));
            remainingUsage = remainingUsage.subtract(usageInTier);
        }

        return totalFee.setScale(0, RoundingMode.HALF_UP);
    }

    private Long generateOrderCode(Integer invoiceId) {
        long timestampSuffix = System.currentTimeMillis() % 1_000_000L;
        return Long.parseLong(invoiceId.toString() + timestampSuffix);
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