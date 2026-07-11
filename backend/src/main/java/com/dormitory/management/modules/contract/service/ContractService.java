package com.dormitory.management.modules.contract.service;

import com.dormitory.management.constants.ContractStatus;
import com.dormitory.management.modules.auth.entity.Staff;
import com.dormitory.management.modules.auth.repository.StaffRepository;
import com.dormitory.management.modules.contract.dto.ContractResponse;
import com.dormitory.management.modules.contract.dto.RenewContractRequest;
import com.dormitory.management.modules.contract.entity.Contract;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.ContractRepository;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.infrastructure.entity.Room;
import com.dormitory.management.modules.infrastructure.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final RoomRepository roomRepository;

    public List<ContractResponse> getStudentContracts(Integer accountId) {
        Student student = studentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        return contractRepository.findByStudent_StudentId(student.getStudentId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ContractResponse> getAllContracts(Integer buildingId) {
        if (buildingId != null) {
            return contractRepository.findByBuilding_BuildingId(buildingId)
                    .stream().map(this::mapToResponse).collect(Collectors.toList());
        }
        return contractRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ContractResponse getContractById(Integer contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found"));
        return mapToResponse(contract);
    }

    @Transactional
    public ContractResponse renewContract(Integer contractId, Integer staffAccountId, RenewContractRequest request) {
        Contract oldContract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found"));

        if (oldContract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalArgumentException("Can only renew ACTIVE contracts");
        }

        Staff staff = staffRepository.findByAccountId(staffAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found"));

        // Tạo hợp đồng mới
        Contract newContract = Contract.builder()
                .student(oldContract.getStudent())
                .room(oldContract.getRoom())
                .building(oldContract.getBuilding())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .deposit(request.getDeposit())
                .status(ContractStatus.ACTIVE)
                .previousContract(oldContract)
                .createdByStaff(staff)
                .build();

        // Đánh dấu hợp đồng cũ là EXPIRED
        oldContract.setStatus(ContractStatus.EXPIRED);
        contractRepository.save(oldContract);

        Contract savedNewContract = contractRepository.save(newContract);
        return mapToResponse(savedNewContract);
    }

    @Transactional
    public ContractResponse checkout(Integer contractId, Integer staffAccountId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found"));

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalArgumentException("Can only checkout ACTIVE contracts");
        }

        // Cập nhật hợp đồng
        contract.setStatus(ContractStatus.TERMINATED);
        contract.setActualCheckoutDate(LocalDate.now());
        contractRepository.save(contract);

        // Giảm số người trong phòng
        Room room = contract.getRoom();
        if (room.getCurrentOccupancy() > 0) {
            room.setCurrentOccupancy((byte) (room.getCurrentOccupancy() - 1));
            roomRepository.save(room);
        }

        return mapToResponse(contract);
    }

    private ContractResponse mapToResponse(Contract contract) {
        return ContractResponse.builder()
                .contractId(contract.getContractId())
                .studentId(contract.getStudent().getStudentId())
                .studentName(contract.getStudent().getFullName())
                .studentCode(contract.getStudent().getStudentCode())
                .roomId(contract.getRoom().getRoomId())
                .roomNumber(contract.getRoom().getRoomNumber())
                .buildingId(contract.getBuilding().getBuildingId())
                .buildingName(contract.getBuilding().getName())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .deposit(contract.getDeposit())
                .status(contract.getStatus())
                .previousContractId(contract.getPreviousContract() != null ? contract.getPreviousContract().getContractId() : null)
                .createdByStaffId(contract.getCreatedByStaff() != null ? contract.getCreatedByStaff().getStaffId() : null)
                .createdAt(contract.getCreatedAt())
                .actualCheckoutDate(contract.getActualCheckoutDate())
                .build();
    }
}
