package com.dormitory.management.modules.contract.service;

import com.dormitory.management.constants.ApplicationStatus;
import com.dormitory.management.constants.ContractStatus;
import com.dormitory.management.modules.auth.entity.Staff;
import com.dormitory.management.modules.auth.repository.StaffRepository;
import com.dormitory.management.modules.contract.dto.RoomApplicationRequest;
import com.dormitory.management.modules.contract.dto.RoomApplicationResponse;
import com.dormitory.management.modules.contract.entity.Contract;
import com.dormitory.management.modules.contract.entity.RoomApplication;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.ContractRepository;
import com.dormitory.management.modules.contract.repository.RoomApplicationRepository;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.infrastructure.entity.Building;
import com.dormitory.management.modules.infrastructure.entity.Room;
import com.dormitory.management.modules.infrastructure.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomApplicationService {

    private final RoomApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final StaffRepository staffRepository;
    private final ContractRepository contractRepository;

    public List<RoomApplicationResponse> getStudentApplications(Integer accountId) {
        Student student = studentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        return applicationRepository.findByStudent_StudentId(student.getStudentId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<RoomApplicationResponse> getAllApplications(Integer buildingId) {
        if (buildingId != null) {
            return applicationRepository.findByBuilding_BuildingId(buildingId)
                    .stream().map(this::mapToResponse).collect(Collectors.toList());
        }
        return applicationRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public RoomApplicationResponse submitApplication(Integer accountId, RoomApplicationRequest request) {
        Student student = studentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
                
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (room.getCurrentOccupancy() >= room.getMaxCapacity()) {
            throw new IllegalArgumentException("Room is full");
        }

        RoomApplication app = RoomApplication.builder()
                .student(student)
                .room(room)
                .building(room.getBuilding())
                .status(ApplicationStatus.Pending)
                .note(request.getNote())
                .build();

        RoomApplication savedApp = applicationRepository.save(app);
        return mapToResponse(savedApp);
    }

    @Transactional
    public RoomApplicationResponse approveApplication(Integer applicationId, Integer staffAccountId) {
        RoomApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        if (app.getStatus() != ApplicationStatus.Pending) {
            throw new IllegalArgumentException("Can only approve PENDING applications");
        }

        Staff staff = staffRepository.findByAccountId(staffAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found"));

        // Kiểm tra lại chỗ trống
        Room room = app.getRoom();
        if (room.getCurrentOccupancy() >= room.getMaxCapacity()) {
            throw new IllegalArgumentException("Room is full, cannot approve");
        }

        app.setStatus(ApplicationStatus.Approved);
        app.setReviewedByStaff(staff);
        app.setReviewedAt(LocalDateTime.now());
        
        applicationRepository.save(app);

        // Tự động sinh Hợp đồng (Contract)
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusMonths(6); // Mặc định hợp đồng 6 tháng
        BigDecimal deposit = room.getPrice(); // Tiền cọc bằng tiền 1 tháng

        Contract contract = Contract.builder()
                .student(app.getStudent())
                .room(room)
                .building(room.getBuilding())
                .startDate(startDate)
                .endDate(endDate)
                .deposit(deposit)
                .status(ContractStatus.Active)
                .createdByStaff(staff)
                .build();

        contractRepository.save(contract);
        
        // Tăng số người trong phòng
        room.setCurrentOccupancy((byte) (room.getCurrentOccupancy() + 1));
        roomRepository.save(room);

        return mapToResponse(app);
    }

    @Transactional
    public RoomApplicationResponse rejectApplication(Integer applicationId, Integer staffAccountId, String reason) {
        RoomApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        if (app.getStatus() != ApplicationStatus.Pending) {
            throw new IllegalArgumentException("Can only reject PENDING applications");
        }

        Staff staff = staffRepository.findByAccountId(staffAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found"));

        app.setStatus(ApplicationStatus.Rejected);
        app.setReviewedByStaff(staff);
        app.setReviewedAt(LocalDateTime.now());
        app.setRejectReason(reason);

        applicationRepository.save(app);
        return mapToResponse(app);
    }

    private RoomApplicationResponse mapToResponse(RoomApplication app) {
        return RoomApplicationResponse.builder()
                .applicationId(app.getApplicationId())
                .studentId(app.getStudent().getStudentId())
                .studentName(app.getStudent().getFullName())
                .studentCode(app.getStudent().getStudentCode())
                .roomId(app.getRoom().getRoomId())
                .roomNumber(app.getRoom().getRoomNumber())
                .buildingId(app.getBuilding().getBuildingId())
                .buildingName(app.getBuilding().getName())
                .status(app.getStatus())
                .note(app.getNote())
                .submittedAt(app.getSubmittedAt())
                .rejectReason(app.getRejectReason())
                .reviewedByStaffId(app.getReviewedByStaff() != null ? app.getReviewedByStaff().getStaffId() : null)
                .reviewedAt(app.getReviewedAt())
                .build();
    }
}
