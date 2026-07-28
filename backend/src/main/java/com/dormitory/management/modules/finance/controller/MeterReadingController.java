package com.dormitory.management.modules.finance.controller;

import com.dormitory.management.modules.finance.dto.MeterReadingBulkUpdateRequest;
import com.dormitory.management.modules.finance.entity.MeterReading;
import com.dormitory.management.modules.finance.service.MeterReadingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meter-readings")
@RequiredArgsConstructor
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    @GetMapping("/filter")
    public ResponseEntity<List<com.dormitory.management.modules.finance.dto.MeterReadingResponse>> getMeterReadings(
            @RequestParam Integer buildingId,
            @RequestParam(required = false) Integer floorNumber,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        return ResponseEntity.ok(meterReadingService.getOrGenerateMeterReadings(buildingId, floorNumber, month));
    }

    @PutMapping("/bulk-update")
    public ResponseEntity<Void> bulkUpdateMeterReadings(@RequestBody List<MeterReadingBulkUpdateRequest> requests) {
        meterReadingService.bulkUpdateReadings(requests);
        return ResponseEntity.ok().build();
    }
}

