package com.dormitory.management.modules.finance.controller;

import com.dormitory.management.constants.PaymentGateway;
import com.dormitory.management.modules.finance.dto.PaymentCallbackResult;
import com.dormitory.management.modules.finance.entity.Invoice;
import com.dormitory.management.modules.finance.service.InvoicePaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * ⚠️ CHƯA CÓ SPRING SECURITY trong project — các endpoint dưới đây đang MỞ HOÀN TOÀN.
 * Trước khi lên production BẮT BUỘC phải:
 *  - Bảo vệ /api/payments/{invoiceId}/create bằng auth (chỉ chủ hóa đơn / staff được gọi)
 *  - Bảo vệ /api/payments/manual-confirm bằng role STAFF/ADMIN
 *  - Các endpoint /callback/** KHÔNG cần auth (do VNPay/MoMo gọi trực tiếp),
 *    an toàn dựa vào việc verify chữ ký bên trong InvoicePaymentService.
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final InvoicePaymentService invoicePaymentService;

    /**
     * Sinh viên bấm "Thanh toán" trên giao diện -> chọn cổng -> BE trả về URL để redirect.
     * VD: POST /api/payments/1002/create?gateway=VNPAY
     */
    @PostMapping("/{invoiceId}/create")
    public ResponseEntity<Map<String, String>> createPayment(
            @PathVariable Integer invoiceId,
            @RequestParam PaymentGateway gateway,
            HttpServletRequest request) throws Exception {

        String clientIp = extractClientIp(request);
        String paymentUrl = invoicePaymentService.createPaymentUrl(invoiceId, gateway, clientIp);

        Map<String, String> body = new LinkedHashMap<>();
        body.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(body);
    }

    /**
     * VNPay redirect trình duyệt người dùng về URL này sau khi thanh toán (không phải nguồn tin cậy tuyệt đối,
     * chỉ dùng để hiển thị kết quả cho người dùng — trạng thái CHÍNH THỨC phải dựa vào IPN ở dưới).
     */
    @GetMapping("/callback/vnpay/return")
    public ResponseEntity<PaymentCallbackResult> vnpayReturn(@RequestParam Map<String, String> allParams) {
        PaymentCallbackResult result = invoicePaymentService.handleGatewayCallback(PaymentGateway.VNPAY, allParams);
        return ResponseEntity.ok(result);
    }

    /**
     * VNPay IPN — server-to-server, đây mới là nguồn xác nhận thanh toán CHÍNH THỨC.
     */
    @GetMapping("/callback/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> allParams) {
        PaymentCallbackResult result = invoicePaymentService.handleGatewayCallback(PaymentGateway.VNPAY, allParams);
        return ResponseEntity.ok(buildVnpayIpnResponse(result));
    }

    /**
     * MoMo gọi IPN dạng POST JSON body -> Spring tự bind các field cùng tên vào Map<String,String>
     * nếu dùng @RequestBody Map<String,String>. Field numeric (amount, resultCode...) sẽ tự thành String.
     */
    @PostMapping("/callback/momo/ipn")
    public ResponseEntity<Map<String, String>> momoIpn(@RequestBody Map<String, String> body) {
        PaymentCallbackResult result = invoicePaymentService.handleGatewayCallback(PaymentGateway.MOMO, body);

        Map<String, String> response = new LinkedHashMap<>();
        response.put("resultCode", result.isSignatureValid() ? "0" : "97"); // 97 = MoMo: chữ ký không hợp lệ
        response.put("message", result.getMessage());
        return ResponseEntity.ok(response);
    }

    /**
     * Staff xác nhận thủ công khi sinh viên chuyển khoản ngân hàng và đối soát bằng tay
     * (dựa trên paymentCounterpartCode ghi trong nội dung chuyển khoản).
     * TODO: khi có Spring Security, giới hạn @PreAuthorize("hasRole('STAFF')") cho endpoint này.
     */
    @PostMapping("/{invoiceId}/manual-confirm")
    public ResponseEntity<Invoice> manualConfirm(
            @PathVariable Integer invoiceId,
            @RequestParam String bankTransactionRef) {

        Invoice invoice = invoicePaymentService.confirmBankTransferManually(invoiceId, bankTransactionRef);
        return ResponseEntity.ok(invoice);
    }

    /**
     * PayOS webhook — payload JSON lồng nhau, dùng type WebhookData của SDK thay vì Map phẳng.
     */
    @PostMapping("/callback/payos/webhook")
    public ResponseEntity<Map<String, Object>> payosWebhook(
            @RequestBody vn.payos.type.WebhookData webhookData,
            @org.springframework.beans.factory.annotation.Autowired
            com.dormitory.management.modules.finance.service.gateway.PayOSService payOSService) {

        PaymentCallbackResult result = invoicePaymentService.handlePayOSWebhook(payOSService, webhookData);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", result.isSignatureValid());
        response.put("message", result.getMessage());
        return ResponseEntity.ok(response);
    }

    private Map<String, String> buildVnpayIpnResponse(PaymentCallbackResult result) {
        Map<String, String> response = new LinkedHashMap<>();
        if (!result.isSignatureValid()) {
            response.put("RspCode", "97");
            response.put("Message", "Invalid Signature");
        } else if (result.getOrderCode() == null) {
            response.put("RspCode", "01");
            response.put("Message", "Order not found");
        } else {
            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
        }
        return response;
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
