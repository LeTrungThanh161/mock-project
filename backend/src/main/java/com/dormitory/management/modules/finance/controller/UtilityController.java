package com.dormitory.management.modules.finance.controller;

import com.dormitory.management.modules.finance.entity.MeterReading;
import com.dormitory.management.modules.finance.service.UtilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/utilities")
@RequiredArgsConstructor
public class UtilityController {

    private final UtilityService utilityService;

    @PostMapping("/meter-readings")
    public ResponseEntity<MeterReading> saveMeterReading(@RequestBody MeterReading reading) {
        MeterReading savedReading = utilityService.saveMeterReading(reading);
        return ResponseEntity.ok(savedReading);
    }

    @PostMapping("/invoices/batch")
    public ResponseEntity<String> generateBatchInvoices(
            @RequestParam(required = false) String billingMonth,
            @RequestParam(required = false) Integer staffId) {
        LocalDate month = billingMonth != null
                ? LocalDate.parse(billingMonth + "-01")
                : LocalDate.now().withDayOfMonth(1);
        Integer effectiveStaffId = staffId != null ? staffId : 1;
        utilityService.generateInvoicesForMonth(month, effectiveStaffId);
        return ResponseEntity.ok("Batch invoices generated successfully for " + month.getYear() + "-" + month.getMonthValue());
    }

    @GetMapping("/meter-readings")
    public ResponseEntity<java.util.List<MeterReading>> getAllMeterReadings() {
        return ResponseEntity.ok(utilityService.getAllMeterReadings());
    }

    @GetMapping("/invoices")
    public ResponseEntity<java.util.List<com.dormitory.management.modules.finance.entity.Invoice>> getAllInvoices() {
        return ResponseEntity.ok(utilityService.getAllInvoices());
    }
}
