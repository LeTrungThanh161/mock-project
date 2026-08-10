package com.dormitory.management.modules.finance.controller;
import com.dormitory.management.constants.PaymentStatus;
import com.dormitory.management.modules.contract.entity.Contract;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.ContractRepository;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.finance.dto.InvoiceResponse;
import com.dormitory.management.modules.finance.entity.Invoice;
import com.dormitory.management.modules.finance.repository.InvoiceRepository;
import com.dormitory.management.modules.finance.service.InvoicePaymentService;
import com.dormitory.management.modules.infrastructure.entity.Room;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class InvoiceControllerTest {

   @Test
void getMyInvoicesReturnsInvoicesForCurrentStudent() {
    InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
    StudentRepository studentRepository = mock(StudentRepository.class);
    ContractRepository contractRepository = mock(ContractRepository.class);
    InvoicePaymentService invoicePaymentService = mock(InvoicePaymentService.class);

    InvoiceController controller = new InvoiceController(
            invoiceRepository,
            studentRepository,
            contractRepository,
            invoicePaymentService
    );

    HttpServletRequest request = mock(HttpServletRequest.class);
    when(request.getAttribute("accountId")).thenReturn(7);

    Student student = new Student();
    student.setStudentId(10);

    when(studentRepository.findByAccountId(7))
            .thenReturn(Optional.of(student));

    Room room = new Room();
    room.setRoomId(20);

    Contract contract = new Contract();
    contract.setRoom(room);

    when(contractRepository.findByStudent_StudentId(10))
            .thenReturn(List.of(contract));

    Invoice invoice = Invoice.builder()
            .invoiceId(100)
            .room(room)
            .billingMonth(LocalDate.of(2026, 7, 1))
            .dueDate(LocalDate.of(2026, 8, 10))
            .paymentStatus(PaymentStatus.Unpaid)
            .roomFee(new BigDecimal("800000"))
            .electricityFee(new BigDecimal("100000"))
            .waterFee(new BigDecimal("50000"))
            .internetFee(new BigDecimal("100000"))
            .build();

    when(invoiceRepository.findByRoom_RoomIdIn(List.of(20)))
            .thenReturn(List.of(invoice));

    InvoiceResponse invoiceResponse = InvoiceResponse.builder()
            .invoiceId(100)
            .roomId(20)
            .billingMonth(LocalDate.of(2026, 7, 1))
            .dueDate(LocalDate.of(2026, 8, 10))
            .paymentStatus(PaymentStatus.Unpaid.name())
            .build();

    when(invoicePaymentService.buildInvoiceResponses(List.of(invoice)))
            .thenReturn(List.of(invoiceResponse));

    ResponseEntity<List<InvoiceResponse>> response =
            controller.getMyInvoices(request, null);

    assertEquals(200, response.getStatusCode().value());
    assertEquals(1, response.getBody().size());
    assertEquals(100, response.getBody().get(0).getInvoiceId());
}   @Test
void getInvoicesReturnsBuildingScopedInvoicesForManager() {
    InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
    StudentRepository studentRepository = mock(StudentRepository.class);
    ContractRepository contractRepository = mock(ContractRepository.class);
    InvoicePaymentService invoicePaymentService = mock(InvoicePaymentService.class);

    InvoiceController controller = new InvoiceController(
            invoiceRepository,
            studentRepository,
            contractRepository,
            invoicePaymentService
    );

    HttpServletRequest request = mock(HttpServletRequest.class);
    when(request.getAttribute("role")).thenReturn("Manager");
    when(request.getAttribute("buildingId")).thenReturn(3);

    Invoice invoice = Invoice.builder()
            .invoiceId(200)
            .build();

    when(invoiceRepository.findByBuilding_BuildingId(3))
            .thenReturn(List.of(invoice));

    InvoiceResponse invoiceResponse = InvoiceResponse.builder()
            .invoiceId(200)
            .build();

    when(invoicePaymentService.buildInvoiceResponses(List.of(invoice)))
            .thenReturn(List.of(invoiceResponse));

    ResponseEntity<List<InvoiceResponse>> response =
            controller.getInvoices(request, null);

    assertEquals(200, response.getStatusCode().value());
    assertEquals(1, response.getBody().size());
    assertEquals(200, response.getBody().get(0).getInvoiceId());
}
}