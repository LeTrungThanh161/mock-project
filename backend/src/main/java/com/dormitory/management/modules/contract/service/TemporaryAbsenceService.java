package com.dormitory.management.modules.contract.service;

import com.dormitory.management.constants.ApplicationStatus;
import com.dormitory.management.constants.ContractStatus;
import com.dormitory.management.modules.contract.dto.TemporaryAbsenceRequest;
import com.dormitory.management.modules.contract.dto.TemporaryAbsenceResponse;
import com.dormitory.management.modules.contract.entity.Contract;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.entity.TemporaryAbsence;
import com.dormitory.management.modules.contract.repository.ContractRepository;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.contract.repository.TemporaryAbsenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemporaryAbsenceService {

    private final TemporaryAbsenceRepository absenceRepository;
    private final StudentRepository studentRepository;
    private final ContractRepository contractRepository;

    public List<TemporaryAbsenceResponse> getStudentAbsences(Integer accountId) {
        Student student = studentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        return absenceRepository.findByStudent_StudentId(student.getStudentId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<TemporaryAbsenceResponse> getAllAbsences() {
        return absenceRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public TemporaryAbsenceResponse submitAbsence(Integer accountId, TemporaryAbsenceRequest request) {
        Student student = studentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new IllegalArgumentException("Contract not found"));

        if (!contract.getStudent().getStudentId().equals(student.getStudentId())) {
            throw new IllegalArgumentException("Cannot submit absence for another student's contract");
        }
        
        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalArgumentException("Contract is not active");
        }

        TemporaryAbsence absence = TemporaryAbsence.builder()
                .student(student)
                .contract(contract)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .status(ApplicationStatus.PENDING)
                .build();

        TemporaryAbsence savedAbsence = absenceRepository.save(absence);
        return mapToResponse(savedAbsence);
    }

    @Transactional
    public TemporaryAbsenceResponse approveAbsence(Integer absenceId) {
        TemporaryAbsence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new IllegalArgumentException("Absence not found"));

        if (absence.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("Can only approve PENDING absences");
        }

        absence.setStatus(ApplicationStatus.APPROVED);
        absenceRepository.save(absence);
        return mapToResponse(absence);
    }

    private TemporaryAbsenceResponse mapToResponse(TemporaryAbsence absence) {
        return TemporaryAbsenceResponse.builder()
                .absenceId(absence.getAbsenceId())
                .studentId(absence.getStudent().getStudentId())
                .studentName(absence.getStudent().getFullName())
                .contractId(absence.getContract().getContractId())
                .roomNumber(absence.getContract().getRoom().getRoomNumber())
                .startDate(absence.getStartDate())
                .endDate(absence.getEndDate())
                .reason(absence.getReason())
                .status(absence.getStatus())
                .createdAt(absence.getCreatedAt())
                .build();
    }
}
