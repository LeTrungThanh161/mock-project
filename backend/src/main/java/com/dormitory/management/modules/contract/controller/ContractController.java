package com.dormitory.management.modules.contract.controller;

import com.dormitory.management.modules.contract.dto.ContractResponse;
import com.dormitory.management.modules.contract.dto.RenewContractRequest;
import com.dormitory.management.modules.contract.service.ContractService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    // Student: Xem hợp đồng của mình
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ContractResponse>> getMyContracts(HttpServletRequest request) {
        Integer accountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.ok(contractService.getStudentContracts(accountId));
    }

    // Admin/Manager: Xem danh sách hợp đồng
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ContractResponse>> getAllContracts(
            @RequestParam(required = false) Integer buildingId) {
        return ResponseEntity.ok(contractService.getAllContracts(buildingId));
    }

    // Admin/Manager: Gia hạn hợp đồng
    @PostMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ContractResponse> renewContract(
            @PathVariable Integer id,
            @RequestBody RenewContractRequest renewRequest,
            HttpServletRequest request) {
        Integer staffAccountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contractService.renewContract(id, staffAccountId, renewRequest));
    }

    // Admin/Manager: Trả phòng / Chấm dứt hợp đồng
    @PostMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ContractResponse> checkoutContract(
            @PathVariable Integer id,
            HttpServletRequest request) {
        Integer staffAccountId = (Integer) request.getAttribute("accountId");
        return ResponseEntity.ok(contractService.checkout(id, staffAccountId));
    }
}
