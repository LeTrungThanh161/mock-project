package com.dormitory.management.modules.issue.repository;

import com.dormitory.management.modules.issue.entity.IssueTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IssueTicketRepository extends JpaRepository<IssueTicket, Integer> {
}
