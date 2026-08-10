package com.dormitory.management.modules.issue.controller;

import com.dormitory.management.modules.auth.entity.Account;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.issue.dto.IssueTicketRequest;
import com.dormitory.management.modules.issue.entity.IssueTicket;
import com.dormitory.management.modules.issue.entity.IssueTicketHistory;
import com.dormitory.management.modules.issue.repository.IssueTicketHistoryRepository;
import com.dormitory.management.modules.issue.repository.IssueTicketRepository;
import com.dormitory.management.modules.issue.service.HelpdeskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/helpdesk")
@RequiredArgsConstructor
public class HelpdeskController {

    private final HelpdeskService helpdeskService;
    private final IssueTicketHistoryRepository issueTicketHistoryRepository;
    private final IssueTicketRepository issueTicketRepository;
    private final StudentRepository studentRepository;
    private final JdbcTemplate jdbcTemplate;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<IssueTicket> createTicket(
            @RequestPart("ticket") IssueTicketRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Authentication auth) throws IOException {

        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            Account account = (Account) auth.getPrincipal();
            Student student = studentRepository.findByAccountId(account.getAccountId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            request.setStudentId(student.getStudentId());
        }

        IssueTicket ticket = helpdeskService.createTicket(request, image);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<IssueTicket> assignTechnician(
            @PathVariable Integer id,
            @RequestParam Integer technicianId,
            Authentication auth) {
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            jdbcTemplate.execute("EXEC dbo.sp_SetSecurityContext @Role = N'Admin'");
        }
        IssueTicket ticket = helpdeskService.assignTechnician(id, technicianId);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<IssueTicket> rejectTicket(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String reason,
            Authentication auth) {
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            jdbcTemplate.execute("EXEC dbo.sp_SetSecurityContext @Role = N'Admin'");
        }
        String rejectReason = reason;
        if ((rejectReason == null || rejectReason.isEmpty()) && body != null) {
            rejectReason = body.get("reason");
        }
        IssueTicket ticket = helpdeskService.rejectTicket(id, rejectReason);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<IssueTicket> completeTicket(@PathVariable Integer id, Authentication auth) {
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            jdbcTemplate.execute("EXEC dbo.sp_SetSecurityContext @Role = N'Admin'");
        }
        IssueTicket ticket = helpdeskService.completeTicket(id);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<IssueTicketHistory>> getTicketHistory(@PathVariable Integer id) {
        List<IssueTicketHistory> history = issueTicketHistoryRepository.findByTicketTicketIdOrderByChangedAtDesc(id);
        return ResponseEntity.ok(history);
    }

    @GetMapping
    public ResponseEntity<List<IssueTicket>> getAllTickets(Authentication auth) {
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            Account account = (Account) auth.getPrincipal();
            // Bypass RLS temporarily for this query so we can fetch this student's tickets
            jdbcTemplate.execute("EXEC dbo.sp_SetSecurityContext @Role = N'Admin'");
            List<IssueTicket> tickets = issueTicketRepository.findByStudent_AccountId_AccountId(account.getAccountId());
            return ResponseEntity.ok(tickets);
        }

        List<IssueTicket> tickets = helpdeskService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }
}
