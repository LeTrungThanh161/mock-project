package com.dormitory.management.modules.issue.controller;

import com.dormitory.management.modules.issue.entity.IssueTicket;
import com.dormitory.management.modules.issue.repository.IssueTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issue-tickets")
@RequiredArgsConstructor
public class IssueTicketController {

    private final IssueTicketRepository issueTicketRepository;

    @GetMapping
    public ResponseEntity<List<IssueTicket>> getAllIssueTickets() {
        return ResponseEntity.ok(issueTicketRepository.findAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<IssueTicket>> getMyIssueTickets() {
        // Mock data logic for Student
        return ResponseEntity.ok(List.of());
    }

    @PostMapping
    public ResponseEntity<IssueTicket> saveIssueTicket(@RequestBody IssueTicket ticket) {
        return ResponseEntity.ok(issueTicketRepository.save(ticket));
    }
}
