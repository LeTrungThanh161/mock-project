package com.dormitory.management.modules.finance.repository;

import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.modules.finance.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    List<Invoice> findByContract_ContractIdIn(List<Integer> contractIds);
    Optional<Invoice> findByOrderCode(Long orderCode);

    List<Invoice> findByRoom_RoomId(Integer roomId);

    List<Invoice> findByRoom_RoomIdIn(List<Integer> roomIds);

    List<Invoice> findByBuilding_BuildingId(Integer buildingId);

    boolean existsByContract_ContractIdAndInvoiceTypeAndBillingMonth(Integer contractId, String invoiceType, LocalDate billingMonth);

    /**
     * Dùng cho job nhắc nộp tiền: hóa đơn UNPAID sắp/đã đến hạn.
     */
    List<Invoice> findByPaymentStatusAndDueDateLessThanEqual(PaymentStatus status, LocalDate dueDate);
}
