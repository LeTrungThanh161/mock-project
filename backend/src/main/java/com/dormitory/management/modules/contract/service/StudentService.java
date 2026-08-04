package com.dormitory.management.modules.contract.service;

import com.dormitory.management.modules.auth.repository.AccountRepository;
import com.dormitory.management.modules.contract.dto.RegistrationResult;
import com.dormitory.management.modules.contract.dto.StudentResponse;
import com.dormitory.management.modules.contract.dto.StudentUpdateRequest;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.contract.repository.ContractRepository;
import com.dormitory.management.modules.contract.entity.Contract;
import com.dormitory.management.modules.infrastructure.repository.RoomRepository;
import com.dormitory.management.modules.infrastructure.entity.Room;
import com.dormitory.management.constants.ContractStatus;
import com.dormitory.management.constants.PaymentGateway;
import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.constants.RoomStatus;
import com.dormitory.management.modules.finance.entity.Invoice;
import com.dormitory.management.modules.finance.repository.InvoiceRepository;
import com.dormitory.management.modules.finance.service.InvoicePaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AccountRepository accountRepository;
    private final RoomRepository roomRepository;
    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoicePaymentService invoicePaymentService;

    @Transactional(readOnly = true)
    public StudentResponse getProfile(Integer accountId) {
        Student student = studentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for this account"));
        return mapToResponse(student);
    }

    @Transactional
    public StudentResponse updateProfile(Integer accountId, StudentUpdateRequest request) {
        Student student = studentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for this account"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            student.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            student.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getClassName() != null) {
            student.setClassName(request.getClassName());
        }

        Student updatedStudent = studentRepository.save(student);
        return mapToResponse(updatedStudent);
    }

    @Transactional
    public RegistrationResult registerRoom(Integer accountId, Integer roomId) throws Exception {
        Student student = studentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (room.getStatus() != RoomStatus.Available || room.getCurrentOccupancy() >= room.getMaxCapacity()) {
            throw new IllegalStateException("Room is no longer available");
        }

        Contract contract = Contract.builder()
                .student(student)
                .room(room)
                .building(room.getBuilding())
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(6))
                .deposit(room.getPrice())
                .status(ContractStatus.Active)
                .createdAt(LocalDateTime.now())
                .build();

        contractRepository.save(contract);

        room.setCurrentOccupancy((byte) (room.getCurrentOccupancy() + 1));
        if (room.getCurrentOccupancy() >= room.getMaxCapacity()) {
            room.setStatus(RoomStatus.Full);
        }
        roomRepository.save(room);

        Invoice invoice = Invoice.builder()
                .room(room)
                .building(room.getBuilding())
                .billingMonth(LocalDate.now().withDayOfMonth(1))
                .roomFee(room.getPrice())
                .electricityFee(BigDecimal.ZERO)
                .waterFee(BigDecimal.ZERO)
                .internetFee(BigDecimal.ZERO)
                .dueDate(LocalDate.now().plusDays(7))
                .paymentStatus(PaymentStatus.Unpaid)
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);
        String paymentUrl = invoicePaymentService.createPaymentUrl(savedInvoice.getInvoiceId(), PaymentGateway.VNPAY, "127.0.0.1");

        return RegistrationResult.builder()
                .message("Đăng ký phòng và tạo hợp đồng thành công.")
                .contractId(contract.getContractId())
                .invoiceId(savedInvoice.getInvoiceId())
                .paymentUrl(paymentUrl)
                .build();
    }

    private StudentResponse mapToResponse(Student student) {
        return StudentResponse.builder()
                .studentId(student.getStudentId())
                .accountId(student.getAccountId() != null ? student.getAccountId().getAccountId() : null)
                .studentCode(student.getStudentCode())
                .fullName(student.getFullName())
                .gender(student.getGender())
                .phoneNumber(student.getPhoneNumber())
                .className(student.getClassName())
                .status(student.getStatus())
                .build();
    }
}
