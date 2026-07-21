package com.dormitory.management.modules.finance.service.gateway;

import com.dormitory.management.constants.PaymentGateway;
import com.dormitory.management.modules.finance.dto.PaymentCallbackResult;
import com.dormitory.management.modules.finance.entity.Invoice;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Tài liệu tham khảo: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 *
 * ⚠️ CẦN CẤU HÌNH trong application.properties (đã thêm placeholder, bạn thay giá trị thật):
 *   vnpay.tmn-code, vnpay.hash-secret, vnpay.pay-url, vnpay.return-url
 */
@Service
public class VNPayService implements PaymentGatewayService {

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.pay-url}")
    private String payUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Override
    public PaymentGateway getGateway() {
        return PaymentGateway.VNPAY;
    }

    @Override
    public String createPaymentUrl(Invoice invoice, String clientIp) throws Exception {
        long amount = invoice.getTotalAmount().longValue() * 100; // VNPay yêu cầu amount * 100 (không có phần thập phân)
        // Ghép orderCode + timestamp để mỗi lần tạo link là 1 txnRef khác nhau
        // (VNPay yêu cầu vnp_TxnRef duy nhất trong ngày -> quan trọng khi cho thanh toán lại)
        String txnRef = invoice.getOrderCode() + "-" + System.currentTimeMillis();
        String createDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String expireDate = LocalDateTime.now().plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan hoa don " + invoice.getPaymentCounterpartCode());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", (clientIp == null || clientIp.isBlank()) ? "127.0.0.1" : clientIp);
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        String hashData = buildHashData(params);
        String secureHash = hmacSHA512(hashSecret, hashData);

        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                    .append('=')
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                    .append('&');
        }
        query.append("vnp_SecureHash=").append(secureHash);

        return payUrl + "?" + query;
    }

    @Override
    public PaymentCallbackResult verifyCallback(Map<String, String> params) {
        Map<String, String> fields = new TreeMap<>(params);
        String receivedHash = fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType"); // field cũ, không tham gia tính hash

        String calculatedHash;
        try {
            calculatedHash = hmacSHA512(hashSecret, buildHashData(fields));
        } catch (Exception e) {
            return PaymentCallbackResult.builder()
                    .signatureValid(false)
                    .success(false)
                    .message("Lỗi tính chữ ký: " + e.getMessage())
                    .build();
        }

        boolean signatureValid = calculatedHash.equalsIgnoreCase(receivedHash);
        if (!signatureValid) {
            return PaymentCallbackResult.builder()
                    .signatureValid(false)
                    .success(false)
                    .message("Chữ ký không hợp lệ — có thể bị giả mạo callback")
                    .build();
        }

        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        boolean success = "00".equals(responseCode) && "00".equals(transactionStatus);

        Long orderCode = null;
        String txnRef = params.get("vnp_TxnRef");
        if (txnRef != null && txnRef.contains("-")) {
            try {
                orderCode = Long.parseLong(txnRef.substring(0, txnRef.indexOf('-')));
            } catch (NumberFormatException ignored) {
                // để null, caller sẽ tự báo lỗi không tìm thấy invoice
            }
        }

        return PaymentCallbackResult.builder()
                .signatureValid(true)
                .success(success)
                .orderCode(orderCode)
                .transactionRef(params.get("vnp_TransactionNo"))
                .message("VNPay response code: " + responseCode)
                .build();
    }

    private String buildHashData(Map<String, String> sortedParams) {
        StringBuilder sb = new StringBuilder();
        Iterator<Map.Entry<String, String>> it = sortedParams.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, String> entry = it.next();
            if (entry.getValue() == null || entry.getValue().isEmpty()) continue;
            sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                    .append('=')
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
            if (it.hasNext()) sb.append('&');
        }
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac hmac512 = Mac.getInstance("HmacSHA512");
        hmac512.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
