package com.dormitory.management.modules.finance.controller;

import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.modules.contract.entity.Contract;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.ContractRepository;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.finance.dto.InvoiceResponse;
import com.dormitory.management.modules.finance.entity.Invoice;
import com.dormitory.management.modules.finance.repository.InvoiceRepository;
import com.dormitory.management.modules.finance.service.InvoicePaymentService;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final StudentRepository studentRepository;
    private final ContractRepository contractRepository;
    private final InvoicePaymentService invoicePaymentService;

    @Autowired
    public InvoiceController(InvoiceRepository invoiceRepository,
                             StudentRepository studentRepository,
                             ContractRepository contractRepository,
                             InvoicePaymentService invoicePaymentService) {
        this.invoiceRepository = invoiceRepository;
        this.studentRepository = studentRepository;
        this.contractRepository = contractRepository;
        this.invoicePaymentService = invoicePaymentService;
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getInvoices(HttpServletRequest request,
                                                             @RequestParam(required = false) String status) {
        String role = (String) request.getAttribute("role");
        Integer buildingId = (Integer) request.getAttribute("buildingId");

        List<Invoice> invoices;

        if ("Admin".equalsIgnoreCase(role)) {
            invoices = invoiceRepository.findAll();
        } else if ("Manager".equalsIgnoreCase(role) && buildingId != null) {
            invoices = invoiceRepository.findByBuilding_BuildingId(buildingId);
        } else {
            // ===== Sinh viên: chỉ lấy hóa đơn theo contract của chính mình =====
            Integer accountId = (Integer) request.getAttribute("accountId");
            if (accountId == null) {
                return ResponseEntity.status(401).build();
            }

            Student student = studentRepository.findByAccountId(accountId).orElse(null);
            if (student == null || student.getStudentId() == null) {
                return ResponseEntity.ok(List.of());
            }

            List<Integer> contractIds = contractRepository.findByStudent_StudentId(student.getStudentId())
                    .stream()
                    .map(Contract::getContractId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (contractIds.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            invoices = invoiceRepository.findByContract_ContractIdIn(contractIds);
        }

        // Filter theo status (nếu có)
        if (status != null && !status.isBlank()) {
            PaymentStatus paymentStatus = Arrays.stream(PaymentStatus.values())
                    .filter(e -> e.name().equalsIgnoreCase(status.trim()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Trạng thái không hợp lệ: " + status));

            invoices = invoices.stream()
                    .filter(invoice -> paymentStatus.equals(invoice.getPaymentStatus()))
                    .toList();
        }

        return ResponseEntity.ok(invoicePaymentService.buildInvoiceResponses(invoices));
    }

    @GetMapping("/my")
    public ResponseEntity<List<InvoiceResponse>> getMyInvoices(HttpServletRequest request,
                                                               @RequestParam(required = false) String status) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        if (accountId == null) {
            return ResponseEntity.status(401).build();
        }

        Student student = studentRepository.findByAccountId(accountId).orElse(null);
        if (student == null || student.getStudentId() == null) {
            return ResponseEntity.ok(List.of());
        }

        // ===== Chỉ lấy hóa đơn theo contract của sinh viên đang đăng nhập =====
        List<Integer> contractIds = contractRepository.findByStudent_StudentId(student.getStudentId())
                .stream()
                .map(Contract::getContractId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (contractIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Invoice> invoices = invoiceRepository.findByContract_ContractIdIn(contractIds);

        // Filter theo status (nếu có)
        if (status != null && !status.isBlank()) {
            PaymentStatus paymentStatus = Arrays.stream(PaymentStatus.values())
                    .filter(e -> e.name().equalsIgnoreCase(status.trim()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Trạng thái không hợp lệ: " + status));

            invoices = invoices.stream()
                    .filter(invoice -> paymentStatus.equals(invoice.getPaymentStatus()))
                    .toList();
        }

        return ResponseEntity.ok(invoicePaymentService.buildInvoiceResponses(invoices));
    }
}