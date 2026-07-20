package com.dormitory.management.modules.issue.controller;

import com.dormitory.management.modules.issue.entity.Technician;
import com.dormitory.management.modules.issue.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianRepository technicianRepository;

    @GetMapping
    public ResponseEntity<List<Technician>> getAllTechnicians() {
        return ResponseEntity.ok(technicianRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Technician> saveTechnician(@RequestBody Technician technician) {
        return ResponseEntity.ok(technicianRepository.save(technician));
    }
}
