package com.dormitory.management.modules.finance.controller;

import com.dormitory.management.modules.finance.entity.MeterReading;
import com.dormitory.management.modules.finance.repository.MeterReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meter-readings")
@RequiredArgsConstructor
public class MeterReadingController {

    private final MeterReadingRepository meterReadingRepository;

    @GetMapping
    public ResponseEntity<List<MeterReading>> getAllMeterReadings() {
        return ResponseEntity.ok(meterReadingRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<MeterReading> saveMeterReading(@RequestBody MeterReading reading) {
        return ResponseEntity.ok(meterReadingRepository.save(reading));
    }
}
