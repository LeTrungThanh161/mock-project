package com.dormitory.management.modules.finance.repository;

import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.modules.finance.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    Optional<Invoice> findByOrderCode(Long orderCode);

    List<Invoice> findByRoom_RoomId(Integer roomId);

    /**
     * Dùng cho job nhắc nộp tiền: hóa đơn UNPAID sắp/đã đến hạn.
     */
    List<Invoice> findByPaymentStatusAndDueDateLessThanEqual(PaymentStatus status, LocalDate dueDate);
}
