package com.dormitory.management.modules.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kết quả đã được chuẩn hóa sau khi 1 PaymentGatewayService xác minh callback
 * (chữ ký hợp lệ, thanh toán thành công hay không, mã đơn hàng, mã giao dịch...).
 * Giúp InvoicePaymentService xử lý thống nhất mà không cần biết chi tiết
 * format riêng của VNPay/MoMo.
 */
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCallbackResult {

    /** Chữ ký hợp lệ hay không — nếu false, TUYỆT ĐỐI không được cập nhật trạng thái hóa đơn. */
    private boolean signatureValid;

    /** Giao dịch có thành công hay không (theo response/result code của cổng). */
    private boolean success;

    /** orderCode của Invoice (được gửi đi lúc tạo link, gateway trả lại nguyên vẹn). */
    private Long orderCode;

    /** Mã giao dịch phía cổng thanh toán trả về (lưu vào Invoice.transactionRef). */
    private String transactionRef;

    /** Thông điệp mô tả (log/debug). */
    private String message;
}
