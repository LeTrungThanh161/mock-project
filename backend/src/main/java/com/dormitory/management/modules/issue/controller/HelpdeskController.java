package com.dormitory.management.modules.issue.controller;

import com.dormitory.management.modules.issue.dto.IssueTicketRequest;
import com.dormitory.management.modules.issue.entity.IssueTicket;
import com.dormitory.management.modules.issue.entity.IssueTicketHistory;
import com.dormitory.management.modules.issue.repository.IssueTicketHistoryRepository;
import com.dormitory.management.modules.issue.service.HelpdeskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/helpdesk")
@RequiredArgsConstructor
public class HelpdeskController {

    private final HelpdeskService helpdeskService;
    private final IssueTicketHistoryRepository issueTicketHistoryRepository;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<IssueTicket> createTicket(
            @RequestPart("ticket") IssueTicketRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        IssueTicket ticket = helpdeskService.createTicket(request, image);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<IssueTicket> assignTechnician(
            @PathVariable Integer id,
            @RequestParam Integer technicianId) {
        IssueTicket ticket = helpdeskService.assignTechnician(id, technicianId);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<IssueTicket> completeTicket(@PathVariable Integer id) {
        IssueTicket ticket = helpdeskService.completeTicket(id);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<IssueTicketHistory>> getTicketHistory(@PathVariable Integer id) {
        List<IssueTicketHistory> history = issueTicketHistoryRepository.findByTicketTicketIdOrderByChangedAtDesc(id);
        return ResponseEntity.ok(history);
    }

    @GetMapping
    public ResponseEntity<List<IssueTicket>> getAllTickets() {
        List<IssueTicket> tickets = helpdeskService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }
}
