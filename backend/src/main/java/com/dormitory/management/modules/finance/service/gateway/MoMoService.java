package com.dormitory.management.modules.finance.service.gateway;

import com.dormitory.management.constants.PaymentGateway;
import com.dormitory.management.modules.finance.dto.PaymentCallbackResult;
import com.dormitory.management.modules.finance.entity.Invoice;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Tài liệu tham khảo: https://developers.momo.vn/v3/docs/payment/api/wallet/onetime
 *
 * ⚠️ CẦN CẤU HÌNH trong application.properties (đã thêm placeholder):
 *   momo.partner-code, momo.access-key, momo.secret-key, momo.endpoint,
 *   momo.redirect-url, momo.ipn-url
 */
@Service
public class MoMoService implements PaymentGatewayService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String endpoint; // VD sandbox: https://test-payment.momo.vn/v2/gateway/api/create

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    @Override
    public PaymentGateway getGateway() {
        return PaymentGateway.MOMO;
    }

    @Override
    public String createPaymentUrl(Invoice invoice, String clientIp) throws Exception {
        String orderId = invoice.getOrderCode() + "-" + UUID.randomUUID().toString().substring(0, 8);
        String requestId = UUID.randomUUID().toString();
        long amount = invoice.getTotalAmount().longValue();
        String orderInfo = "Thanh toan hoa don " + invoice.getPaymentCounterpartCode();
        String requestType = "captureWallet";
        String extraData = "";

        // Chuỗi ký phải đúng THỨ TỰ theo tài liệu MoMo, không được sắp xếp alphabet tùy ý
        String rawSignature = "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + ipnUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + partnerCode +
                "&redirectUrl=" + redirectUrl +
                "&requestId=" + requestId +
                "&requestType=" + requestType;

        String signature = hmacSHA256(secretKey, rawSignature);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", partnerCode);
        body.put("requestId", requestId);
        body.put("amount", amount);
        body.put("orderId", orderId);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", redirectUrl);
        body.put("ipnUrl", ipnUrl);
        body.put("extraData", extraData);
        body.put("requestType", requestType);
        body.put("signature", signature);
        body.put("lang", "vi");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body, headers);

        JsonNode response = restTemplate.postForObject(endpoint, httpEntity, JsonNode.class);
        if (response == null || response.get("payUrl") == null) {
            throw new IllegalStateException("MoMo không trả về payUrl: " +
                    (response == null ? "null response" : response.toString()));
        }
        return response.get("payUrl").asText();
    }

    @Override
    public PaymentCallbackResult verifyCallback(Map<String, String> params) {
        String receivedSignature = params.get("signature");

        // Thứ tự field ký cho IPN khác với lúc tạo link — theo đúng tài liệu MoMo
        String rawSignature = "accessKey=" + accessKey +
                "&amount=" + params.get("amount") +
                "&extraData=" + params.getOrDefault("extraData", "") +
                "&message=" + params.get("message") +
                "&orderId=" + params.get("orderId") +
                "&orderInfo=" + params.get("orderInfo") +
                "&orderType=" + params.get("orderType") +
                "&partnerCode=" + params.get("partnerCode") +
                "&payType=" + params.get("payType") +
                "&requestId=" + params.get("requestId") +
                "&responseTime=" + params.get("responseTime") +
                "&resultCode=" + params.get("resultCode") +
                "&transId=" + params.get("transId");

        String calculatedSignature;
        try {
            calculatedSignature = hmacSHA256(secretKey, rawSignature);
        } catch (Exception e) {
            return PaymentCallbackResult.builder()
                    .signatureValid(false)
                    .success(false)
                    .message("Lỗi tính chữ ký: " + e.getMessage())
                    .build();
        }

        boolean signatureValid = calculatedSignature.equals(receivedSignature);
        if (!signatureValid) {
            return PaymentCallbackResult.builder()
                    .signatureValid(false)
                    .success(false)
                    .message("Chữ ký không hợp lệ — có thể bị giả mạo callback")
                    .build();
        }

        boolean success = "0".equals(params.get("resultCode"));

        // orderId khi tạo link có dạng "{orderCode}-{random8ky}" -> tách lại orderCode gốc
        Long orderCode = null;
        String orderId = params.get("orderId");
        if (orderId != null && orderId.contains("-")) {
            try {
                orderCode = Long.parseLong(orderId.substring(0, orderId.indexOf('-')));
            } catch (NumberFormatException ignored) {
            }
        }

        return PaymentCallbackResult.builder()
                .signatureValid(true)
                .success(success)
                .orderCode(orderCode)
                .transactionRef(params.get("transId"))
                .message("MoMo resultCode: " + params.get("resultCode"))
                .build();
    }

    private String hmacSHA256(String key, String data) throws Exception {
        Mac hmac256 = Mac.getInstance("HmacSHA256");
        hmac256.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] bytes = hmac256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
