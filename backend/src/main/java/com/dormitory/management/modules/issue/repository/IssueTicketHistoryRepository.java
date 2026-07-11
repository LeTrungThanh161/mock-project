package com.dormitory.management.modules.issue.repository;

import com.dormitory.management.modules.issue.entity.IssueTicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueTicketHistoryRepository extends JpaRepository<IssueTicketHistory, Integer> {
    List<IssueTicketHistory> findByTicketTicketIdOrderByChangedAtDesc(Integer ticketId);
}
