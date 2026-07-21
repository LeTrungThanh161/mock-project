package com.dormitory.management.modules.finance.service;

import com.dormitory.management.constants.PaymentGateway;
import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.constants.UtilityType;
import com.dormitory.management.modules.auth.entity.Staff;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service trung tâm xử lý nghiệp vụ hóa đơn & thanh toán ký túc xá.
 *
 * 1) Tính tiền điện/nước theo biểu giá bậc thang (PricingTier)
 * 2) Sinh hóa đơn (Invoice) từ chỉ số công tơ (MeterReading)
 * 3) Tạo link thanh toán — chọn cổng linh hoạt (VNPay / MoMo) qua Strategy pattern
 * 4) Xử lý callback (return URL / IPN) — có xác minh chữ ký + idempotent
 * 5) Xác nhận chuyển khoản ngân hàng thủ công (staff thao tác tay)
 *
 * ⚠️ GIẢ ĐỊNH đã xác nhận theo project thực tế:
 *  - PaymentStatus: UNPAID, PAID
 *  - UtilityType: ELECTRICITY, WATER (dùng ở PricingTier.utilityType)
 */
@Service
@RequiredArgsConstructor
public class InvoicePaymentService {

    private final InvoiceRepository invoiceRepository;
    private final PricingTierRepository pricingTierRepository;
    private final List<PaymentGatewayService> gatewayServiceList; // Spring tự inject mọi bean implement interface

    private Map<PaymentGateway, PaymentGatewayService> gatewayMap;

    @PostConstruct
    void initGatewayMap() {
        gatewayMap = gatewayServiceList.stream()
                .collect(Collectors.toMap(PaymentGatewayService::getGateway, g -> g,
                        (a, b) -> a, () -> new EnumMap<>(PaymentGateway.class)));
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
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

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

        BigDecimal electricityFee = calculateTieredFee(UtilityType.ELECTRICITY, electricConsumption);
        BigDecimal waterFee = calculateTieredFee(UtilityType.WATER, waterConsumption);

        Invoice invoice = Invoice.builder()
                .room(reading.getRoom())
                .building(reading.getBuilding())
                .billingMonth(reading.getBillingMonth())
                .roomFee(roomFee)
                .electricityFee(electricityFee)
                .waterFee(waterFee)
                .internetFee(internetFee)
                .dueDate(reading.getBillingMonth().plusMonths(1).withDayOfMonth(10))
                .paymentStatus(PaymentStatus.UNPAID)
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

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán");
        }

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
        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            return result;
        }

        if (result.isSuccess()) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
            invoice.setTransactionRef(result.getTransactionRef());
            invoice.setPaymentDate(LocalDate.now());
        } else {
            // Enum chỉ có UNPAID/PAID -> giữ UNPAID, xóa link cũ để tạo lại link mới khi thử lại
            invoice.setPaymentCheckoutUrl(null);
        }

        invoiceRepository.save(invoice);
        return result;
    }

    // ============================================================
    // 4b. XỬ LÝ WEBHOOK RIÊNG CHO PAYOS (payload JSON khác cấu trúc)
    // ============================================================
    @Transactional
    public PaymentCallbackResult handlePayOSWebhook(com.dormitory.management.modules.finance.service.gateway.PayOSService payOSService,
                                                      vn.payos.type.WebhookData webhookData) {
        PaymentCallbackResult result = payOSService.verifyWebhook(webhookData);

        if (!result.isSignatureValid() || result.getOrderCode() == null) {
            return result;
        }

        Invoice invoice = invoiceRepository.findByOrderCode(result.getOrderCode()).orElse(null);
        if (invoice == null) {
            return result.toBuilder()
                    .message("Không tìm thấy hóa đơn ứng với orderCode: " + result.getOrderCode())
                    .build();
        }

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            return result; // idempotent
        }

        if (result.isSuccess()) {
            invoice.setPaymentStatus(PaymentStatus.PAID);
            invoice.setTransactionRef(result.getTransactionRef());
            invoice.setPaymentDate(LocalDate.now());
        } else {
            invoice.setPaymentCheckoutUrl(null);
        }

        invoiceRepository.save(invoice);
        return result;
    }

    // ============================================================
    // 5. XÁC NHẬN CHUYỂN KHOẢN NGÂN HÀNG THỦ CÔNG (staff thao tác)
    // ============================================================
    @Transactional
    public Invoice confirmBankTransferManually(Integer invoiceId, String bankTransactionRef) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn: " + invoiceId));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán trước đó");
        }

        invoice.setPaymentMethod(PaymentGateway.BANK_TRANSFER.name());
        invoice.setTransactionRef(bankTransactionRef);
        invoice.setPaymentStatus(PaymentStatus.PAID);
        invoice.setPaymentDate(LocalDate.now());

        return invoiceRepository.save(invoice);
    }
}
