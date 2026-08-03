package com.dormitory.management.modules.issue.repository;

import com.dormitory.management.modules.issue.entity.IssueTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueTicketRepository extends JpaRepository<IssueTicket, Integer> {
    List<IssueTicket> findByStudent_AccountId_AccountId(Integer accountId);
    
    long countByStatus(com.dormitory.management.constants.TicketStatus status);
}
