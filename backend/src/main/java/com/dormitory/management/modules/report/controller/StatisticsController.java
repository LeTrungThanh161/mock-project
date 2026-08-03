package com.dormitory.management.modules.report.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.auth.repository.StaffRepository;
import com.dormitory.management.modules.issue.repository.TechnicianRepository;
import com.dormitory.management.modules.infrastructure.repository.RoomRepository;
import com.dormitory.management.modules.issue.repository.IssueTicketRepository;
import com.dormitory.management.constants.RoomStatus;
import com.dormitory.management.constants.TicketStatus;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final TechnicianRepository technicianRepository;
    private final RoomRepository roomRepository;
    private final IssueTicketRepository issueTicketRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long totalStudents = studentRepository.count();
        long totalEmployees = staffRepository.count() + technicianRepository.count();
        long totalRooms = roomRepository.count();
        long activeRooms = roomRepository.countByStatusNot(RoomStatus.UnderMaintenance);
        long issuesCount = issueTicketRepository.countByStatus(TicketStatus.Pending)
                + issueTicketRepository.countByStatus(TicketStatus.InProgress);

        return ResponseEntity.ok(Map.of(
                "totalStudents", totalStudents,
                "totalEmployees", totalEmployees,
                "activeRooms", activeRooms,
                "totalRooms", totalRooms,
                "issuesCount", issuesCount,
                "occupancyRate", (totalRooms > 0) ? (activeRooms * 100 / totalRooms) : 0));
    }
}
