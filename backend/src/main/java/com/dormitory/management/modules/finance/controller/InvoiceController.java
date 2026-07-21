package com.dormitory.management.modules.finance.controller;

import com.dormitory.management.modules.finance.entity.Invoice;
import com.dormitory.management.modules.finance.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(invoiceRepository.findAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Invoice>> getMyInvoices() {
        // Mock data logic for Student
        return ResponseEntity.ok(List.of());
    }
}
