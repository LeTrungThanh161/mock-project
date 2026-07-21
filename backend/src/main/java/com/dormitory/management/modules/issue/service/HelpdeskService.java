package com.dormitory.management.modules.issue.service;

import com.dormitory.management.common.service.CloudinaryService;
import com.dormitory.management.constants.TicketStatus;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.infrastructure.entity.Building;
import com.dormitory.management.modules.infrastructure.entity.Room;
import com.dormitory.management.modules.issue.dto.IssueTicketRequest;
import com.dormitory.management.modules.issue.entity.IssueTicket;
import com.dormitory.management.modules.issue.entity.IssueTicketHistory;
import com.dormitory.management.modules.issue.entity.Technician;
import com.dormitory.management.modules.issue.repository.IssueTicketHistoryRepository;
import com.dormitory.management.modules.issue.repository.IssueTicketRepository;
import com.dormitory.management.modules.issue.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class HelpdeskService {

    private final IssueTicketRepository issueTicketRepository;
    private final IssueTicketHistoryRepository issueTicketHistoryRepository;
    private final TechnicianRepository technicianRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public IssueTicket createTicket(IssueTicketRequest request, MultipartFile imageFile) throws IOException {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(imageFile);
        }

        Room room = new Room();
        room.setRoomId(request.getRoomId());

        Building building = new Building();
        building.setBuildingId(request.getBuildingId());

        Student student = new Student();
        student.setStudentId(request.getStudentId());

        IssueTicket ticket = IssueTicket.builder()
                .room(room)
                .building(building)
                .student(student)
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(TicketStatus.Pending)
                .imagePath(imageUrl)
                .createdAt(LocalDateTime.now())
                .build();

        IssueTicket savedTicket = issueTicketRepository.save(ticket);

        // Record history
        IssueTicketHistory history = IssueTicketHistory.builder()
                .ticket(savedTicket)
                .oldStatus(null)
                .newStatus(TicketStatus.Pending)
                .changedAt(LocalDateTime.now())
                .build();
        issueTicketHistoryRepository.save(history);

        return savedTicket;
    }

    @Transactional
    public IssueTicket assignTechnician(Integer ticketId, Integer technicianId) {
        IssueTicket ticket = issueTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        TicketStatus oldStatus = ticket.getStatus();

        ticket.setAssignedTechnician(technician);
        ticket.setStatus(TicketStatus.InProgress);

        IssueTicket updatedTicket = issueTicketRepository.save(ticket);

        // Record history
        IssueTicketHistory history = IssueTicketHistory.builder()
                .ticket(updatedTicket)
                .oldStatus(oldStatus)
                .newStatus(TicketStatus.InProgress)
                .changedAt(LocalDateTime.now())
                .build();
        issueTicketHistoryRepository.save(history);

        return updatedTicket;
    }

    @Transactional
    public IssueTicket completeTicket(Integer ticketId) {
        IssueTicket ticket = issueTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(TicketStatus.Completed);
        ticket.setResolvedAt(LocalDateTime.now());

        if (ticket.getAssignedTechnician() != null) {
            Technician technician = ticket.getAssignedTechnician();
            technician.setStatus(com.dormitory.management.constants.AccountStatus.Active);
            technicianRepository.save(technician);
        }

        IssueTicket updatedTicket = issueTicketRepository.save(ticket);

        IssueTicketHistory history = IssueTicketHistory.builder()
                .ticket(updatedTicket)
                .oldStatus(oldStatus)
                .newStatus(TicketStatus.Completed)
                .changedAt(LocalDateTime.now())
                .build();
        issueTicketHistoryRepository.save(history);

        return updatedTicket;
    }

    @Transactional(readOnly = true)
    public java.util.List<IssueTicket> getAllTickets() {
        return issueTicketRepository.findAll();
    }
}
