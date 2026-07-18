package com.dormitory.management.modules.finance.entity;

import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.modules.auth.entity.Staff;
import com.dormitory.management.modules.infrastructure.entity.Building;
import com.dormitory.management.modules.infrastructure.entity.Room;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Invoice", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"roomId", "billingMonth"})
})
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roomId", nullable = false)
    private Room room;

    /**
     * Đồng bộ tự động từ Room bằng trigger TRG_Invoice_SyncBuilding ở DB.
     * Phục vụ Row-Level Security (RLS).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buildingId", nullable = false)
    private Building building;

    @Column(nullable = false)
    private LocalDate billingMonth;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal roomFee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal electricityFee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal waterFee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal internetFee;

    /**
     * Computed column (PERSISTED) trong DB: RoomFee + ElectricityFee + WaterFee + InternetFee.
     * Chỉ đọc từ phía Java, không insert/update.
     */
    @Column(insertable = false, updatable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(length = 20)
    private String paymentMethod; // VD: "PAYOS", "BANK_TRANSFER"

    /**
     * Mã giao dịch từ cổng thanh toán (PayOS trả về webhook) hoặc mã tham chiếu chuyển khoản ngân hàng.
     */
    @Column(length = 100)
    private String transactionRef;

    private LocalDate paymentDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generatedByStaffId")
    private Staff generatedByStaff;

    // ==========================================
    // 🚀 BỔ SUNG ĐỂ TÍCH HỢP CỔNG THANH TOÁN
    // ==========================================

    /**
     * Mã đơn hàng gửi sang PayOS (Bắt buộc là kiểu số Long từ 1 đến 9007199254740991).
     * Bạn có thể dùng thuật toán sinh mã ngẫu nhiên hoặc dùng chính (invoiceId + timestamp).
     */
    @Column(unique = true)
    private Long orderCode;

    /**
     * Lưu lại Payment Link từ PayOS trả về để sinh viên có thể bấm thanh toán lại bất kỳ lúc nào.
     */
    @Column(length = 500)
    private String paymentCheckoutUrl;

    /**
     * Nội dung chuyển khoản định sẵn phục vụ Internet Banking (Ví dụ: KTX_HD_1002).
     * Dùng để sinh viên copy khi chuyển khoản bằng ứng dụng ngân hàng.
     */
    @Column(length = 50, unique = true)
    private String paymentCounterpartCode;
}