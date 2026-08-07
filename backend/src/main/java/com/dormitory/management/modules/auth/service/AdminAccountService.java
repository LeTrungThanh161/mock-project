package com.dormitory.management.modules.auth.service;

import com.dormitory.management.constants.AccountStatus;
import com.dormitory.management.modules.auth.dto.*;
import com.dormitory.management.modules.auth.entity.Account;
import com.dormitory.management.modules.auth.entity.Role;
import com.dormitory.management.modules.auth.entity.Staff;
import com.dormitory.management.modules.auth.repository.AccountRepository;
import com.dormitory.management.modules.auth.repository.RoleRepository;
import com.dormitory.management.modules.auth.repository.StaffRepository;
import com.dormitory.management.modules.contract.entity.Contract;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.ContractRepository;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.infrastructure.entity.Building;
import com.dormitory.management.modules.infrastructure.repository.BuildingRepository;
import com.dormitory.management.constants.ContractStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAccountService {

    private final AccountRepository accountRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final ContractRepository contractRepository;
    private final BuildingRepository buildingRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // ─── STAFF (Ban quản lý) ─────────────────────────────────────────────────

    public List<StaffResponse> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(this::mapStaffToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StaffResponse createManagerAccount(CreateManagerRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại: " + request.getEmail());
        }

        Role managerRole = roleRepository.findByRoleName("Manager")
                .orElseThrow(() -> new IllegalStateException("Role Manager không tồn tại trong DB"));

        Account account = Account.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(AccountStatus.Active)
                .role(managerRole)
                .createdAt(LocalDateTime.now())
                .build();
        account = accountRepository.save(account);

        Building building = null;
        if (request.getBuildingId() != null) {
            building = buildingRepository.findById(request.getBuildingId())
                    .orElseThrow(() -> new IllegalArgumentException("Tòa nhà không tồn tại"));
        }

        Staff staff = Staff.builder()
                .account(account)
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .building(building)
                .position("Manager")
                .createdAt(LocalDateTime.now())
                .build();
        staff = staffRepository.save(staff);

        return mapStaffToResponse(staff);
    }

    @Transactional
    public StaffResponse updateStaff(Integer staffId, UpdateStaffRequest request) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff không tìm thấy: " + staffId));

        staff.setFullName(request.getFullName());
        staff.setPhoneNumber(request.getPhoneNumber());

        if (request.getBuildingId() != null) {
            Building building = buildingRepository.findById(request.getBuildingId())
                    .orElseThrow(() -> new IllegalArgumentException("Tòa nhà không tồn tại"));
            staff.setBuilding(building);
        } else {
            staff.setBuilding(null);
        }

        staffRepository.save(staff);

        // Cập nhật trạng thái Account
        if (request.getStatus() != null) {
            Account account = staff.getAccount();
            account.setStatus(request.getStatus());
            account.setUpdatedAt(LocalDateTime.now());
            accountRepository.save(account);
        }

        return mapStaffToResponse(staff);
    }

    // ─── STUDENT ─────────────────────────────────────────────────────────────

    public Page<StudentAccountResponse> getAllStudents(int page, int size, String search, String className,
            String buildingName, AccountStatus status, Boolean hasRoom) {
        List<Student> all = studentRepository.findAll();

        // Map to Response first to make filtering by building easier
        List<StudentAccountResponse> allResponses = all.stream()
                .map(this::mapStudentToResponse)
                .collect(Collectors.toList());

        // Nếu là Manager, chỉ được xem sinh viên thuộc tòa nhà mình quản lý
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            String email = auth.getName();
            if (auth.getPrincipal() instanceof com.dormitory.management.modules.auth.entity.Account) {
                email = ((com.dormitory.management.modules.auth.entity.Account) auth.getPrincipal()).getEmail();
            }
            Staff staff = staffRepository.findByAccount_Email(email).orElse(null);
            if (staff != null && staff.getBuilding() != null) {
                String managerBuilding = staff.getBuilding().getName();
                allResponses = allResponses.stream()
                        .filter(s -> s.getBuildingName() != null
                                && s.getBuildingName().equalsIgnoreCase(managerBuilding))
                        .collect(Collectors.toList());
            } else if (staff != null) {
                // Nếu là Staff/Manager nhưng chưa được gán tòa nhà, không trả về sinh viên nào
                allResponses = all.stream()
                        .map(this::mapStudentToResponse)
                        .collect(Collectors.toList());
            }
        }

        // Lọc theo từ khóa tìm kiếm
        if (search != null && !search.isBlank()) {
            String kw = search.toLowerCase().trim();
            allResponses = allResponses.stream()
                    .filter(s -> s.getStudentCode().toLowerCase().contains(kw)
                            || s.getFullName().toLowerCase().contains(kw)
                            || (s.getEmail() != null && s.getEmail().toLowerCase().contains(kw)))
                    .collect(Collectors.toList());
        }

        // Lọc theo lớp
        if (className != null && !className.isBlank()) {
            String cls = className.toLowerCase().trim();
            allResponses = allResponses.stream()
                    .filter(s -> s.getClassName() != null && s.getClassName().toLowerCase().contains(cls))
                    .collect(Collectors.toList());
        }

        // Lọc theo trạng thái
        if (status != null) {
            allResponses = allResponses.stream()
                    .filter(s -> s.getStatus() == status)
                    .collect(Collectors.toList());
        }

        // Lọc theo tòa nhà
        if (buildingName != null && !buildingName.isBlank()) {
            String bName = buildingName.toLowerCase().trim();
            allResponses = allResponses.stream()
                    .filter(s -> s.getBuildingName() != null && s.getBuildingName().toLowerCase().contains(bName))
                    .collect(Collectors.toList());
        }

        // Lọc theo tình trạng xếp phòng
        if (hasRoom != null) {
            allResponses = allResponses.stream()
                    .filter(s -> {
                        boolean assigned = s.getRoomNumber() != null && !s.getRoomNumber().isEmpty();
                        return hasRoom ? assigned : !assigned;
                    })
                    .collect(Collectors.toList());
        }

        int total = allResponses.size();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, total);

        List<StudentAccountResponse> pageContent = (fromIndex >= total)
                ? List.of()
                : allResponses.subList(fromIndex, toIndex);

        return new PageImpl<>(pageContent, PageRequest.of(page, size), total);
    }

    @Transactional
    public void resetStudentPassword(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));
        // Reset về mật khẩu mặc định: "123456"
        account.setPasswordHash(passwordEncoder.encode("12345678"));
        account.setUpdatedAt(LocalDateTime.now());
        accountRepository.save(account);
    }

    @Transactional
    public StudentAccountResponse toggleStudentStatus(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));

        if (account.getStatus() == AccountStatus.Active) {
            account.setStatus(AccountStatus.Locked);
        } else {
            account.setStatus(AccountStatus.Active);
        }
        account.setUpdatedAt(LocalDateTime.now());
        accountRepository.save(account);

        Student student = studentRepository.findByAccountId(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Sinh viên không tồn tại"));
        return mapStudentToResponse(student);
    }

    // ─── Mapping helpers ─────────────────────────────────────────────────────

    private StaffResponse mapStaffToResponse(Staff staff) {
        Account account = staff.getAccount();
        return StaffResponse.builder()
                .staffId(staff.getStaffId())
                .accountId(account != null ? account.getAccountId() : null)
                .email(account != null ? account.getEmail() : null)
                .fullName(staff.getFullName())
                .phoneNumber(staff.getPhoneNumber())
                .roleName(account != null && account.getRole() != null ? account.getRole().getRoleName() : null)
                .buildingId(staff.getBuilding() != null ? staff.getBuilding().getBuildingId() : null)
                .buildingName(staff.getBuilding() != null ? staff.getBuilding().getName() : "Tất cả")
                .status(account != null ? account.getStatus() : null)
                .build();
    }

    private StudentAccountResponse mapStudentToResponse(Student student) {
        Account account = student.getAccountId();

        // Tìm hợp đồng Active để lấy thông tin phòng/tòa
        String buildingName = "Chưa xếp";
        String roomNumber = null;
        List<Contract> contracts = contractRepository.findByStudent_StudentId(student.getStudentId());
        Contract activeContract = contracts.stream()
                .filter(c -> c.getStatus() == ContractStatus.Active)
                .findFirst()
                .orElse(null);
        if (activeContract != null) {
            buildingName = activeContract.getBuilding().getName();
            roomNumber = activeContract.getRoom().getRoomNumber();
        }

        return StudentAccountResponse.builder()
                .studentId(student.getStudentId())
                .accountId(account != null ? account.getAccountId() : null)
                .studentCode(student.getStudentCode())
                .fullName(student.getFullName())
                .email(account != null ? account.getEmail() : null)
                .className(student.getClassName())
                .buildingName(buildingName)
                .roomNumber(roomNumber)
                .status(account != null ? account.getStatus() : null)
                .build();
    }
}
