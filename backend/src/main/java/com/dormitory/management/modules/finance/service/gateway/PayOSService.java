package com.dormitory.management.modules.finance.service.gateway;

import com.dormitory.management.constants.PaymentGateway;
import com.dormitory.management.modules.finance.dto.PaymentCallbackResult;
import com.dormitory.management.modules.finance.entity.Invoice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

import java.util.List;
import java.util.Map;

@Service
public class PayOSService implements PaymentGatewayService {

    private static final Logger log = LoggerFactory.getLogger(PayOSService.class);

    private final PayOS payOS;
    private final String returnUrl;
    private final String cancelUrl;

    public PayOSService(
            @Value("${payos.client-id}") String clientId,
            @Value("${payos.api-key}") String apiKey,
            @Value("${payos.checksum-key}") String checksumKey,
            @Value("${payos.return-url:https://5sptsgxl-5173.asse.devtunnels.ms/invoices}") String returnUrl,
            @Value("${payos.cancel-url:https://5sptsgxl-5173.asse.devtunnels.ms/invoices") String cancelUrl) {

        PayOS tempPayOS = null;
        try {
            if (clientId != null && !clientId.isBlank()
                    && apiKey != null && !apiKey.isBlank()
                    && checksumKey != null && !checksumKey.isBlank()) {
                tempPayOS = new PayOS(clientId.trim(), apiKey.trim(), checksumKey.trim());
                log.info("PayOSService (v2.0.1) khởi tạo thành công");
            } else {
                log.warn("PayOS credentials thiếu hoặc rỗng");
            }
        } catch (Exception e) {
            log.error("Khởi tạo PayOS thất bại", e);
        }

        this.payOS = tempPayOS;
        this.returnUrl = returnUrl;
        this.cancelUrl = cancelUrl;
    }

    @Override
    public PaymentGateway getGateway() {
        return PaymentGateway.PAYOS;
    }

    @Override
    public String createPaymentUrl(Invoice invoice, String clientIp) throws Exception {
        if (payOS == null) {
            throw new IllegalStateException("PayOS chưa được khởi tạo. Kiểm tra client-id / api-key / checksum-key");
        }

        String description = "Thanh toan " + (invoice.getPaymentCounterpartCode() != null
                ? invoice.getPaymentCounterpartCode()
                : ("HD" + invoice.getInvoiceId()));
        if (description.length() > 25) {
            description = description.substring(0, 25);
        }

        long amount = invoice.getTotalAmount()
                .setScale(0, java.math.RoundingMode.HALF_UP)
                .longValueExact();

        long orderCode = invoice.getOrderCode() != null
                ? invoice.getOrderCode()
                : (System.currentTimeMillis() / 1000);

        log.info("========== PAYOS REQUEST (SDK 2.0.1) ==========");
        log.info("orderCode   = {}", orderCode);
        log.info("amount      = {}", amount);
        log.info("description = {}", description);
        log.info("returnUrl   = {}", returnUrl);
        log.info("cancelUrl   = {}", cancelUrl);
        log.info("==============================================");

        PaymentLinkItem item = PaymentLinkItem.builder()
                .name("Hoa don phong " + (invoice.getRoom() != null ? invoice.getRoom().getRoomNumber() : invoice.getInvoiceId()))
                .quantity(1)
                .price(amount)
                .build();

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .amount(amount)
                .description(description)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .items(List.of(item))
                .build();

        CreatePaymentLinkResponse response = payOS.paymentRequests().create(paymentData);
        log.info("PayOS tạo link thành công: {}", response.getCheckoutUrl());
        return response.getCheckoutUrl();
    }

    @Override
    public PaymentCallbackResult verifyCallback(Map<String, String> params) {
        throw new UnsupportedOperationException(
                "PayOS dùng verifyWebhook() thay vì verifyCallback(Map). Gọi từ Controller.");
    }

    public PaymentCallbackResult verifyWebhook(Object webhookBody) {
        try {
            var verified = payOS.webhooks().verify(webhookBody);

            boolean success = "00".equals(String.valueOf(verified.getCode()));

            return PaymentCallbackResult.builder()
                    .signatureValid(true)
                    .success(success)
                    .orderCode(verified.getOrderCode())
                    .transactionRef(verified.getReference())
                    .message("PayOS code: " + verified.getCode())
                    .build();
        } catch (Exception e) {
            log.error("Verify webhook PayOS thất bại", e);
            return PaymentCallbackResult.builder()
                    .signatureValid(false)
                    .success(false)
                    .message("Webhook PayOS không hợp lệ: " + e.getMessage())
                    .build();
        }
    }
}