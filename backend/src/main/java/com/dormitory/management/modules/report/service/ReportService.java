package com.dormitory.management.modules.report.service;

import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.modules.finance.entity.Invoice;
import com.dormitory.management.modules.finance.repository.InvoiceRepository;
import com.dormitory.management.modules.report.dto.OccupancyReport;
import com.dormitory.management.modules.report.dto.OverdueReport;
import com.dormitory.management.modules.report.dto.RevenueReport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final InvoiceRepository invoiceRepository;

    public OccupancyReport getOccupancyReport() {
        // Mock data since RoomRepository is not available
        long totalRooms = 100;
        long occupiedRooms = 85;
        return OccupancyReport.builder()
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .availableRooms(totalRooms - occupiedRooms)
                .occupancyRate((double) occupiedRooms / totalRooms * 100)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RevenueReport> getRevenueReport(int year) {
        List<Invoice> invoices = invoiceRepository.findAll();
        
        List<RevenueReport> reports = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            LocalDate targetMonth = LocalDate.of(year, month, 1);
            
            List<Invoice> monthInvoices = invoices.stream()
                    .filter(inv -> inv.getBillingMonth() != null &&
                            inv.getBillingMonth().getYear() == year &&
                            inv.getBillingMonth().getMonthValue() == targetMonth.getMonthValue())
                    .collect(Collectors.toList());

            BigDecimal expected = BigDecimal.ZERO;
            BigDecimal actual = BigDecimal.ZERO;

            for (Invoice inv : monthInvoices) {
                BigDecimal total = inv.getRoomFee()
                        .add(inv.getElectricityFee())
                        .add(inv.getWaterFee())
                        .add(inv.getInternetFee());
                expected = expected.add(total);
                if (inv.getPaymentStatus() == PaymentStatus.PAID) {
                    actual = actual.add(total);
                }
            }

            reports.add(RevenueReport.builder()
                    .month(targetMonth)
                    .expectedRevenue(expected)
                    .actualRevenue(actual)
                    .build());
        }
        return reports;
    }

    @Transactional(readOnly = true)
    public List<OverdueReport> getOverdueInvoices() {
        List<Invoice> invoices = invoiceRepository.findAll();
        LocalDate now = LocalDate.now();

        return invoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.UNPAID && inv.getDueDate() != null && inv.getDueDate().isBefore(now))
                .map(inv -> {
                    BigDecimal total = inv.getRoomFee()
                            .add(inv.getElectricityFee())
                            .add(inv.getWaterFee())
                            .add(inv.getInternetFee());
                    long daysOverdue = ChronoUnit.DAYS.between(inv.getDueDate(), now);
                    return OverdueReport.builder()
                            .invoiceId(inv.getInvoiceId())
                            .roomName(inv.getRoom() != null ? inv.getRoom().getRoomNumber() : "Unknown")
                            .buildingName(inv.getBuilding() != null ? inv.getBuilding().getName() : "Unknown")
                            .amountDue(total)
                            .daysOverdue(daysOverdue)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
