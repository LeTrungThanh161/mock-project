package com.dormitory.management.modules.report.controller;

import com.dormitory.management.modules.report.dto.OccupancyReport;
import com.dormitory.management.modules.report.dto.OverdueReport;
import com.dormitory.management.modules.report.dto.RevenueReport;
import com.dormitory.management.modules.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/occupancy")
    public ResponseEntity<OccupancyReport> getOccupancy() {
        return ResponseEntity.ok(reportService.getOccupancyReport());
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueReport>> getRevenue(@RequestParam(required = false) Integer year) {
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        return ResponseEntity.ok(reportService.getRevenueReport(year));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<OverdueReport>> getOverdue() {
        return ResponseEntity.ok(reportService.getOverdueInvoices());
    }
}
