package com.dormitory.management.modules.finance.service.gateway;

import com.dormitory.management.constants.PaymentGateway;
import com.dormitory.management.modules.finance.dto.PaymentCallbackResult;
import com.dormitory.management.modules.finance.entity.Invoice;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

/**
 * Mỗi cổng thanh toán (VNPay, MoMo, ...) implement interface này.
 * InvoicePaymentService KHÔNG biết chi tiết từng cổng, chỉ gọi qua interface chung
 * -> muốn thêm cổng mới (ZaloPay, PayOS...) chỉ cần thêm 1 class implement, không sửa code cũ.
 */
public interface PaymentGatewayService {

    /**
     * Định danh cổng, dùng làm key để InvoicePaymentService chọn đúng bean (xem PaymentGateway enum).
     */
    PaymentGateway getGateway();

    /**
     * Sinh URL thanh toán để redirect người dùng sang cổng.
     * clientIp cần thiết cho VNPay (bắt buộc trong request).
     */
    String createPaymentUrl(Invoice invoice, String clientIp) throws Exception;

    /**
     * Xác minh callback (return URL hoặc IPN/webhook) trả về từ cổng.
     * params: toàn bộ query param (VNPay) hoặc body JSON đã flatten thành map (MoMo).
     * Bên trong PHẢI verify chữ ký trước khi trả success = true.
     */
    PaymentCallbackResult verifyCallback(Map<String, String> params);
}
