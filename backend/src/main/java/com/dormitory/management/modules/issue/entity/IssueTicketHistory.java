package com.dormitory.management.modules.issue.entity;

import com.dormitory.management.constants.TicketStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "IssueTicketHistory")
public class IssueTicketHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticketId", nullable = false)
    private IssueTicket ticket;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TicketStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus newStatus;

    @Column(nullable = false, updatable = false)
    private LocalDateTime changedAt;
}
