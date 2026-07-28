package com.dormitory.management.modules.finance.controller;

import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.ContractRepository;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.finance.entity.Invoice;
import com.dormitory.management.modules.finance.repository.InvoiceRepository;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final StudentRepository studentRepository;
    private final ContractRepository contractRepository;
    @Autowired
    public InvoiceController(InvoiceRepository invoiceRepository,
                             StudentRepository studentRepository,
                             ContractRepository contractRepository) {
        this(invoiceRepository, studentRepository, contractRepository, null);
    }

    public InvoiceController(InvoiceRepository invoiceRepository,
                             StudentRepository studentRepository,
                             ContractRepository contractRepository,
                             Object ignored) {
        this.invoiceRepository = invoiceRepository;
        this.studentRepository = studentRepository;
        this.contractRepository = contractRepository;
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getInvoices(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        Integer buildingId = (Integer) request.getAttribute("buildingId");

        if ("Admin".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(invoiceRepository.findAll());
        }

        if ("Manager".equalsIgnoreCase(role) && buildingId != null) {
            return ResponseEntity.ok(invoiceRepository.findByBuilding_BuildingId(buildingId));
        }

        Integer accountId = (Integer) request.getAttribute("accountId");
        if (accountId == null) {
            return ResponseEntity.status(401).build();
        }

        Student student = studentRepository.findByAccountId(accountId).orElse(null);
        if (student == null || student.getStudentId() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Integer> roomIds = contractRepository.findByStudent_StudentId(student.getStudentId())
                .stream()
                .map(contract -> contract.getRoom() != null ? contract.getRoom().getRoomId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (roomIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(invoiceRepository.findByRoom_RoomIdIn(roomIds));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Invoice>> getMyInvoices(HttpServletRequest request) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        if (accountId == null) {
            return ResponseEntity.status(401).build();
        }

        Student student = studentRepository.findByAccountId(accountId).orElse(null);
        if (student == null || student.getStudentId() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Integer> roomIds = contractRepository.findByStudent_StudentId(student.getStudentId())
                .stream()
                .map(contract -> contract.getRoom() != null ? contract.getRoom().getRoomId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (roomIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(invoiceRepository.findByRoom_RoomIdIn(roomIds));
    }
}
