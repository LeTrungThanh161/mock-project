package com.dormitory.management.modules.report.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(Map.of(
            "totalStudents", 1248,
            "activeRooms", 312,
            "totalRooms", 350,
            "issuesCount", 14,
            "revenue", "428.5M",
            "occupancyRate", 89
        ));
    }
}
