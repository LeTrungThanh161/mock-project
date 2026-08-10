package com.dormitory.management.modules.finance.controller;

import com.dormitory.management.modules.finance.entity.MeterReading;
import com.dormitory.management.modules.finance.service.UtilityService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

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

    /**
     * Manager/Admin xuất hóa đơn tháng cho 1 tòa.
     * Manager chỉ được xuất tòa mình quản lý.
     *
     * Ví dụ: POST
     * /api/utilities/invoices/export?buildingId=1&billingMonth=2026-08-01
     */
    @PostMapping("/invoices/export")
    public ResponseEntity<?> exportInvoices(
            @RequestParam Integer buildingId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate billingMonth,
            HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        Integer managerBuildingId = (Integer) request.getAttribute("buildingId");
        Integer accountId = (Integer) request.getAttribute("accountId");
        if (accountId == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Không xác định được staff đang đăng nhập"));
        }
        if (role == null || (!"Manager".equalsIgnoreCase(role) && !"Admin".equalsIgnoreCase(role))) {
            return ResponseEntity.status(403).body(Map.of("message", "Chỉ Manager/Admin được xuất hóa đơn"));
        }

        // Manager chỉ được xuất tòa mình
        if ("Manager".equalsIgnoreCase(role)) {
            if (managerBuildingId == null || !managerBuildingId.equals(buildingId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Bạn chỉ được xuất hóa đơn cho tòa mình quản lý"));
            }
        }

      int count = utilityService.exportInvoicesForBuilding(buildingId, billingMonth, accountId);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Đã xuất " + count + " hóa đơn");
        body.put("count", count);
        body.put("buildingId", buildingId);
        body.put("billingMonth", billingMonth.toString());
        return ResponseEntity.ok(body);
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