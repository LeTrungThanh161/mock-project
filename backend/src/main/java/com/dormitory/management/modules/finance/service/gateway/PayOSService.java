package com.dormitory.management.modules.finance.service.gateway;

import com.dormitory.management.constants.PaymentGateway;
import com.dormitory.management.modules.finance.dto.PaymentCallbackResult;
import com.dormitory.management.modules.finance.entity.Invoice;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import vn.payos.type.WebhookData;
import vn.payos.type.Webhook;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
/**
 * Tài liệu tham khảo: https://payos.vn/docs/
 *
 * ⚠️ CẦN THÊM DEPENDENCY vào pom.xml:
 *   <dependency>
 *       <groupId>vn.payos</groupId>
 *       <artifactId>payos-java</artifactId>
 *       <version>2.0.1</version>  <!-- kiểm tra version mới nhất trên Maven Central -->
 *   </dependency>
 *
 * ⚠️ CẦN CẤU HÌNH trong application.properties:
 *   payos.client-id, payos.api-key, payos.checksum-key, payos.return-url, payos.cancel-url
 */
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
            @Value("${payos.return-url:http://localhost:5173/student-invoices}") String returnUrl,
            @Value("${payos.cancel-url:http://localhost:5173/student-invoices}") String cancelUrl) {
       PayOS tempPayOS = null;

        try {
            if (clientId != null && !clientId.isBlank() && apiKey != null && !apiKey.isBlank()) {
                tempPayOS = new PayOS(clientId.trim(), apiKey.trim(), checksumKey.trim());
                log.info("PayOSService được khởi tạo thành công");
            } else {
                log.warn("PayOS credentials không hợp lệ hoặc bị thiếu");
            }
        } catch (Exception e) {
            log.error("Khởi tạo PayOS thất bại", e);
            tempPayOS = null;
        }

        // Gán duy nhất 1 lần cho các biến final ở đây
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
        // PayOS yêu cầu description tối đa 25 ký tự
        String description = "Thanh toan " + invoice.getPaymentCounterpartCode();
        if (description.length() > 25) {
            description = description.substring(0, 25);
        }

        ItemData item = ItemData.builder()
                .name("Hoa don phong " + invoice.getRoom().getRoomNumber())
                .quantity(1)
                .price(invoice.getTotalAmount().intValue())
                .build();

        PaymentData paymentData = PaymentData.builder()
                .orderCode(invoice.getOrderCode())
                .amount(invoice.getTotalAmount().intValue())
                .description(description)
                .item(item)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .build();

        CheckoutResponseData response = payOS.createPaymentLink(paymentData);
        return response.getCheckoutUrl();
    }

    /**
     * PayOS webhook gửi JSON có cấu trúc {code, desc, success, data:{...}, signature}.
     * Ở Controller, mình sẽ parse riêng bằng WebhookData của SDK thay vì Map<String,String> phẳng
     * (xem method verifyWebhook bên dưới) — verifyCallback() ở đây chỉ giữ để khớp interface chung,
     * KHÔNG dùng cho PayOS trong thực tế.
     */
    @Override
    public PaymentCallbackResult verifyCallback(Map<String, String> params) {
        throw new UnsupportedOperationException(
                "PayOS dùng verifyWebhook(WebhookData) thay vì verifyCallback(Map) do khác cấu trúc payload. " +
                        "Gọi verifyWebhook() từ Controller.");
    }

    /**
     * Dùng riêng cho PayOS vì payload webhook là JSON lồng nhau, không phải map phẳng như VNPay/MoMo.
     * SDK tự verify chữ ký (throw exception nếu sai) rồi mới trả object đã xác thực.
     */
    public PaymentCallbackResult verifyWebhook(Webhook webhookBody) {
        try {
            WebhookData verified = payOS.verifyPaymentWebhookData(webhookBody);

            boolean success = "00".equals(verified.getCode());

            return PaymentCallbackResult.builder()
                    .signatureValid(true) // verifyPaymentWebhookData throw exception nếu chữ ký sai
                    .success(success)
                    .orderCode(verified.getOrderCode())
                    .transactionRef(verified.getReference())
                    .message("PayOS code: " + verified.getCode())
                    .build();
        } catch (Exception e) {
            return PaymentCallbackResult.builder()
                    .signatureValid(false)
                    .success(false)
                    .message("Webhook PayOS không hợp lệ: " + e.getMessage())
                    .build();
        }
    }
}
