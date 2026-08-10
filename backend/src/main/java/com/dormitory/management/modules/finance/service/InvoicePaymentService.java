package com.dormitory.management.modules.finance.service;

import com.dormitory.management.constants.ContractStatus;
import com.dormitory.management.constants.PaymentGateway;
import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.constants.UtilityType;
import com.dormitory.management.modules.auth.entity.Staff;
import com.dormitory.management.modules.contract.entity.Contract;
import com.dormitory.management.modules.contract.repository.ContractRepository;
import com.dormitory.management.modules.finance.dto.InvoiceResponse;
import com.dormitory.management.modules.infrastructure.entity.Room;
import com.dormitory.management.modules.infrastructure.repository.RoomRepository;
import com.dormitory.management.modules.finance.dto.PaymentCallbackResult;
import com.dormitory.management.modules.finance.entity.Invoice;
import com.dormitory.management.modules.finance.entity.MeterReading;
import com.dormitory.management.modules.finance.entity.PricingTier;
import com.dormitory.management.modules.finance.repository.InvoiceRepository;
import com.dormitory.management.modules.finance.repository.PricingTierRepository;
import com.dormitory.management.modules.finance.service.gateway.PaymentGatewayService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Service trung tâm xử lý nghiệp vụ hóa đơn & thanh toán ký túc xá.
 *
 * 1) Tính tiền điện/nước theo biểu giá bậc thang (PricingTier)
 * 2) Sinh hóa đơn (Invoice) từ chỉ số công tơ (MeterReading)
 * 3) Tạo link thanh toán — chọn cổng linh hoạt (VNPay / MoMo) qua Strategy
 * pattern
 * 4) Xử lý callback (return URL / IPN) — có xác minh chữ ký + idempotent
 * 5) Xác nhận chuyển khoản ngân hàng thủ công (staff thao tác tay)
 *
 * ⚠️ GIẢ ĐỊNH đã xác nhận theo project thực tế:
 * - PaymentStatus: UNPAID, PAID
 * - UtilityType: ELECTRICITY, WATER (dùng ở PricingTier.utilityType)
 */
@Service
@RequiredArgsConstructor
public class InvoicePaymentService {
    private static final Logger log = LoggerFactory.getLogger(InvoicePaymentService.class);
    private final InvoiceRepository invoiceRepository;
    private final PricingTierRepository pricingTierRepository;
    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final List<PaymentGatewayService> gatewayServiceList; // Spring tự inject mọi bean implement interface

    private Map<PaymentGateway, PaymentGatewayService> gatewayMap;

    @PostConstruct
    void initGatewayMap() {
        gatewayMap = new EnumMap<>(PaymentGateway.class);
        for (PaymentGatewayService service : gatewayServiceList) {
            if (service != null && service.getGateway() != null) {
                gatewayMap.putIfAbsent(service.getGateway(), service);
            }
        }
    }

    // ============================================================
    // 1. TÍNH TIỀN ĐIỆN / NƯỚC THEO BẬC THANG (PricingTier)
    // ============================================================
    public BigDecimal calculateTieredFee(UtilityType utilityType, BigDecimal consumption) {
        if (consumption == null || consumption.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        List<PricingTier> tiers = pricingTierRepository.findByUtilityTypeOrderByTierOrderAsc(utilityType);
        if (tiers.isEmpty()) {
            throw new IllegalStateException("Chưa cấu hình biểu giá cho loại: " + utilityType);
        }

        BigDecimal remaining = consumption;
        BigDecimal total = BigDecimal.ZERO;

        for (PricingTier tier : tiers) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0)
                break;

            BigDecimal tierCapacity = (tier.getToUnit() == null)
                    ? remaining // bậc cao nhất, không giới hạn trần
                    : tier.getToUnit().subtract(tier.getFromUnit());

            BigDecimal unitsInThisTier = remaining.min(tierCapacity);
            total = total.add(unitsInThisTier.multiply(tier.getUnitPrice()));
            remaining = remaining.subtract(unitsInThisTier);
        }

        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException(
                    "Sản lượng vượt quá tổng các bậc giá đã cấu hình cho: " + utilityType);
        }

        return total.setScale(2, RoundingMode.HALF_UP);
    }

    // ============================================================
    // 2. SINH HÓA ĐƠN TỪ CHỈ SỐ ĐIỆN NƯỚC
    // ============================================================
    @Transactional
    public Invoice generateInvoiceFromReading(MeterReading reading,
            BigDecimal roomFee,
            BigDecimal internetFee,
            Staff generatedByStaff) {

        BigDecimal electricConsumption = reading.getElectricEnd().subtract(reading.getElectricStart());
        BigDecimal waterConsumption = reading.getWaterEnd().subtract(reading.getWaterStart());

        if (electricConsumption.signum() < 0 || waterConsumption.signum() < 0) {
            throw new IllegalArgumentException("Chỉ số cuối không được nhỏ hơn chỉ số đầu");
        }

        BigDecimal electricityFee = calculateTieredFee(UtilityType.Electric, electricConsumption);
        BigDecimal waterFee = calculateTieredFee(UtilityType.Water, waterConsumption);

        Invoice invoice = Invoice.builder()
                .room(reading.getRoom())
                .building(reading.getBuilding())
                .billingMonth(reading.getBillingMonth())
                .roomFee(roomFee)
                .electricityFee(electricityFee)
                .waterFee(waterFee)
                .internetFee(internetFee)
                .dueDate(reading.getBillingMonth().plusMonths(1).withDayOfMonth(10))
                .paymentStatus(PaymentStatus.Unpaid)
                .generatedByStaff(generatedByStaff)
                .build();

        invoice = invoiceRepository.save(invoice);

        // orderCode & mã đối soát cần invoiceId nên phải sinh SAU lần save đầu tiên
        invoice.setOrderCode(generateOrderCode(invoice.getInvoiceId()));
        invoice.setPaymentCounterpartCode("KTX_HD_" + invoice.getInvoiceId());

        return invoiceRepository.save(invoice);
    }

    private Long generateOrderCode(Integer invoiceId) {
        long timestampSuffix = System.currentTimeMillis() % 1_000_000L;
        return Long.parseLong(invoiceId.toString() + timestampSuffix);
    }

    // ============================================================
    // 3. TẠO LINK THANH TOÁN — CHỌN CỔNG LINH HOẠT
    // ============================================================
 @Transactional
public String createPaymentUrl(Integer invoiceId, PaymentGateway gateway, String clientIp) throws Exception {
    Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn: " + invoiceId));

    if (invoice.getPaymentStatus() == PaymentStatus.Paid) {
        throw new IllegalStateException("Hóa đơn này đã được thanh toán");
    }
// Luôn sinh orderCode mới trước khi tạo link
invoice.setOrderCode(generateOrderCode(invoice.getInvoiceId()));
invoice = invoiceRepository.save(invoice);

    PaymentGatewayService service = gatewayMap.get(gateway);
    if (service == null) {
        throw new IllegalArgumentException("Cổng thanh toán không được hỗ trợ: " + gateway);
    }

    String url = service.createPaymentUrl(invoice, clientIp);

    invoice.setPaymentMethod(gateway.name());
    invoice.setPaymentCheckoutUrl(url);
    invoiceRepository.save(invoice);

    return url;
}

    // ============================================================
    // 4. XỬ LÝ CALLBACK (RETURN URL / IPN) — CÓ VERIFY CHỮ KÝ + IDEMPOTENT
    // ============================================================
    @Transactional
    public PaymentCallbackResult handleGatewayCallback(PaymentGateway gateway, Map<String, String> rawParams) {
        PaymentGatewayService service = gatewayMap.get(gateway);
        if (service == null) {
            throw new IllegalArgumentException("Cổng thanh toán không được hỗ trợ: " + gateway);
        }

        PaymentCallbackResult result = service.verifyCallback(rawParams);

        // Chữ ký sai -> KHÔNG được đụng vào dữ liệu hóa đơn, coi như callback giả mạo
        if (!result.isSignatureValid()) {
            return result;
        }

        if (result.getOrderCode() == null) {
            return result.toBuilder().message("Không xác định được orderCode từ callback").build();
        }

        Invoice invoice = invoiceRepository.findByOrderCode(result.getOrderCode()).orElse(null);
        if (invoice == null) {
            return result.toBuilder()
                    .message("Không tìm thấy hóa đơn ứng với orderCode: " + result.getOrderCode())
                    .build();
        }

        // Idempotent: cổng thanh toán có thể gọi IPN nhiều lần cho cùng 1 giao dịch
        if (invoice.getPaymentStatus() == PaymentStatus.Paid) {
            return result;
        }

        if (result.isSuccess()) {
            invoice.setPaymentStatus(PaymentStatus.Paid);
            invoice.setTransactionRef(result.getTransactionRef());
            invoice.setPaymentDate(LocalDate.now());
            activateRelatedContract(invoice);
        } else {
            invoice.setPaymentCheckoutUrl(null);
            rollbackPendingRegistration(invoice);
        }

        invoiceRepository.save(invoice);
        return result;
    }

    // ============================================================
    // 4b. XỬ LÝ WEBHOOK RIÊNG CHO PAYOS (payload JSON khác cấu trúc)
    // ============================================================
  @Transactional
public PaymentCallbackResult handlePayOSWebhook(
        com.dormitory.management.modules.finance.service.gateway.PayOSService payOSService,
        Object webhookBody) {

    log.info("=== NHẬN WEBHOOK PAYOS ===");
    log.info("Body: {}", webhookBody);

    PaymentCallbackResult result = payOSService.verifyWebhook(webhookBody);

    log.info("signatureValid={}, success={}, orderCode={}, message={}",
            result.isSignatureValid(), result.isSuccess(), result.getOrderCode(), result.getMessage());

    if (!result.isSignatureValid() || result.getOrderCode() == null) {
        log.warn("Webhook không hợp lệ hoặc thiếu orderCode → bỏ qua");
        return result;
    }

    Invoice invoice = invoiceRepository.findByOrderCode(result.getOrderCode()).orElse(null);
    if (invoice == null) {
        log.warn("Không tìm thấy Invoice với orderCode={}", result.getOrderCode());
        return result.toBuilder()
                .message("Không tìm thấy hóa đơn ứng với orderCode: " + result.getOrderCode())
                .build();
    }

    log.info("Tìm thấy Invoice id={}, status hiện tại={}", invoice.getInvoiceId(), invoice.getPaymentStatus());

    if (invoice.getPaymentStatus() == PaymentStatus.Paid) {
        log.info("Invoice đã Paid rồi → idempotent");
        return result;
    }

    if (result.isSuccess()) {
        invoice.setPaymentStatus(PaymentStatus.Paid);
        invoice.setTransactionRef(result.getTransactionRef());
        invoice.setPaymentDate(LocalDate.now());
        invoice.setPaymentMethod(PaymentGateway.PAYOS.name()); // thêm dòng này
        activateRelatedContract(invoice);
        log.info("Đã cập nhật Invoice → PAID và kích hoạt Contract");
    } else {
        invoice.setPaymentCheckoutUrl(null);
        log.info("Thanh toán thất bại → clear checkoutUrl");
    }

    invoiceRepository.save(invoice);
    return result;
}

    private void rollbackPendingRegistration(Invoice invoice) {
        if (invoice.getRoom() == null || invoice.getRoom().getRoomId() == null) {
            return;
        }

        List<Contract> pendingContracts = contractRepository
                .findByRoom_RoomIdAndStatusOrderByCreatedAtDesc(invoice.getRoom().getRoomId(), ContractStatus.Active);

        pendingContracts.stream()
                .filter(contract -> contract.getCreatedAt() != null)
                .filter(contract -> !contract.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(10)))
                .findFirst()
                .ifPresent(contract -> {
                    contractRepository.delete(contract);
                    invoiceRepository.delete(invoice);
                    Room room = contract.getRoom();
                    if (room != null && room.getCurrentOccupancy() > 0) {
                        room.setCurrentOccupancy((byte) (room.getCurrentOccupancy() - 1));
                        roomRepository.save(room);
                    }
                });
    }

    // ============================================================
    // 5. XÁC NHẬN CHUYỂN KHOẢN NGÂN HÀNG THỦ CÔNG (staff thao tác)
    // ============================================================
    @Transactional
    public Invoice confirmBankTransferManually(Integer invoiceId, String bankTransactionRef) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn: " + invoiceId));

        if (invoice.getPaymentStatus() == PaymentStatus.Paid) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán trước đó");
        }

        invoice.setPaymentMethod(PaymentGateway.BANK_TRANSFER.name());
        invoice.setTransactionRef(bankTransactionRef);
        invoice.setPaymentStatus(PaymentStatus.Paid);
        invoice.setPaymentDate(LocalDate.now());
        activateRelatedContract(invoice);

        return invoiceRepository.save(invoice);
    }

   @Transactional
public Invoice createDepositInvoiceForContract(Contract contract) {
    BigDecimal depositAmount = contract.getRoom() != null && contract.getRoom().getPrice() != null
            ? contract.getRoom().getPrice()
            : BigDecimal.ZERO;

    Invoice invoice = Invoice.builder()
            .room(contract.getRoom())
            .building(contract.getBuilding())
            .billingMonth(LocalDate.now().withDayOfMonth(1))
            .roomFee(depositAmount)                    // ← tiền cọc = giá phòng
            .electricityFee(BigDecimal.ZERO)
            .waterFee(BigDecimal.ZERO)
            .internetFee(BigDecimal.ZERO)
            .dueDate(LocalDate.now().plusDays(5))
            .paymentStatus(PaymentStatus.Unpaid)
            .contract(contract)
            .invoiceType("DEPOSIT")
            .build();

    invoice = invoiceRepository.save(invoice);
    invoice.setOrderCode(generateOrderCode(invoice.getInvoiceId()));
    invoice.setPaymentCounterpartCode("KTX_COC_" + invoice.getInvoiceId());
    return invoiceRepository.save(invoice);
}

    @Transactional
    public Invoice createMonthlyInvoiceForContract(Contract contract, LocalDate billingMonth) {
        Invoice invoice = Invoice.builder()
                .room(contract.getRoom())
                .building(contract.getBuilding())
                .billingMonth(billingMonth)
                .roomFee(contract.getRoom().getPrice())
                .electricityFee(BigDecimal.ZERO)
                .waterFee(BigDecimal.ZERO)
                .internetFee(BigDecimal.ZERO)
                .dueDate(billingMonth.plusMonths(1).withDayOfMonth(10))
                .paymentStatus(PaymentStatus.Unpaid)
                .contract(contract)
                .invoiceType("ROOM_FEE")
                .build();
        invoice = invoiceRepository.save(invoice);
        invoice.setOrderCode(generateOrderCode(invoice.getInvoiceId()));
        invoice.setPaymentCounterpartCode("KTX_PHONG_" + invoice.getInvoiceId());
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public List<InvoiceResponse> buildInvoiceResponses(List<Invoice> invoices) {
        return invoices.stream().map(this::buildInvoiceResponse).toList();
    }

    private InvoiceResponse buildInvoiceResponse(Invoice invoice) {
        BigDecimal totalAmount = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal penaltyAmount = BigDecimal.ZERO;
        Integer overdueDays = 0;
        String statusLabel = "Chưa thanh toán";
        boolean canPay = invoice.getPaymentStatus() != PaymentStatus.Paid;

        if (invoice.getDueDate() != null && invoice.getPaymentStatus() != PaymentStatus.Paid) {
            overdueDays = Math.max(0, LocalDate.now().compareTo(invoice.getDueDate()));
            if (overdueDays > 0) {
                penaltyAmount = BigDecimal.valueOf(Math.min(overdueDays, 5)).multiply(BigDecimal.valueOf(50000));
                statusLabel = overdueDays <= 5 ? "Quá hạn" : "Đã bị chấm dứt";
            }
        }

        if (invoice.getPaymentStatus() == PaymentStatus.Paid) {
            statusLabel = "Đã thanh toán";
            canPay = false;
        }

        String invoiceTypeLabel = "Hóa đơn tiền phòng";
        if ("DEPOSIT".equals(invoice.getInvoiceType())) {
            invoiceTypeLabel = "Hóa đơn đặt cọc";
        }

        return InvoiceResponse.builder()
                .invoiceId(invoice.getInvoiceId())
                .roomId(invoice.getRoom() != null ? invoice.getRoom().getRoomId() : null)
                .roomNumber(invoice.getRoom() != null ? invoice.getRoom().getRoomNumber() : null)
                .buildingName(invoice.getBuilding() != null ? invoice.getBuilding().getName() : null)
                .billingMonth(invoice.getBillingMonth())
                .roomFee(invoice.getRoomFee())
                .electricityFee(invoice.getElectricityFee())
                .waterFee(invoice.getWaterFee())
                .internetFee(invoice.getInternetFee())
                .totalAmount(totalAmount.add(penaltyAmount))
                .dueDate(invoice.getDueDate())
                .paymentStatus(invoice.getPaymentStatus() != null ? invoice.getPaymentStatus().name() : null)
                .paymentMethod(invoice.getPaymentMethod())
                .invoiceType(invoice.getInvoiceType())
                .invoiceTypeLabel(invoiceTypeLabel)
                .statusLabel(statusLabel)
                .overdueDays(overdueDays)
                .penaltyAmount(penaltyAmount)
                .canPay(canPay)
                .paymentCheckoutUrl(invoice.getPaymentCheckoutUrl())
                .paymentCounterpartCode(invoice.getPaymentCounterpartCode())
                .contractId(invoice.getContract() != null ? invoice.getContract().getContractId() : null)
                .build();
    }

private void activateRelatedContract(Invoice invoice) {
    if (invoice == null || invoice.getContract() == null) {
        return;
    }

    Contract contract = invoice.getContract();
    if (contract.getStatus() != ContractStatus.Inactive) {
        return;
    }

    contract.setStatus(ContractStatus.Active);
    contractRepository.save(contract);
    log.info("Đã kích hoạt Contract id={} → Active (không tạo hóa đơn tháng)", contract.getContractId());
}

}
