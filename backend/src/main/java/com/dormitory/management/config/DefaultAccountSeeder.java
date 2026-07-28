package com.dormitory.management.config;

import com.dormitory.management.constants.AccountStatus;
import com.dormitory.management.constants.Gender;
import com.dormitory.management.constants.StudentStatus;
import com.dormitory.management.modules.auth.entity.Account;
import com.dormitory.management.modules.auth.entity.Role;
import com.dormitory.management.modules.auth.entity.Staff;
import com.dormitory.management.modules.auth.repository.AccountRepository;
import com.dormitory.management.modules.auth.repository.RoleRepository;
import com.dormitory.management.modules.auth.repository.StaffRepository;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import com.dormitory.management.modules.infrastructure.entity.Building;
import com.dormitory.management.modules.infrastructure.repository.BuildingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DefaultAccountSeeder {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final BuildingRepository buildingRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        Role adminRole = getOrCreateRole("Admin");
        Role managerRole = getOrCreateRole("Manager");
        Role studentRole = getOrCreateRole("Student");

        Building defaultBuilding = buildingRepository.findByName("Tòa A")
                .orElseGet(() -> buildingRepository.save(Building.builder()
                        .name("Tòa A")
                        .genderType(Gender.Mixed)
                        .totalFloors((byte) 8)
                        .build()));

        seedAccount("admin@dorm.local", "admin123", adminRole, "Nguyễn Quản Trị", "Admin", defaultBuilding);
        seedAccount("manager@dorm.local", "manager123", managerRole, "Trần Quản Lý", "Manager", defaultBuilding);
        seedAccount("student@dorm.local", "student123", studentRole, "Lê Sinh Viên", "Student", null);
    }

    private void seedAccount(String email, String rawPassword, Role role, String fullName, String position, Building building) {
        Account account = accountRepository.findByEmail(email).orElseGet(() -> Account.builder()
                .email(email)
                .status(AccountStatus.Active)
                .role(role)
                .createdAt(LocalDateTime.now())
                .build());

        account.setPasswordHash(passwordEncoder.encode(rawPassword));
        account.setStatus(AccountStatus.Active);
        account.setRole(role);
        if (account.getCreatedAt() == null) {
            account.setCreatedAt(LocalDateTime.now());
        }
        accountRepository.save(account);

        if ("Admin".equals(role.getRoleName()) || "Manager".equals(role.getRoleName())) {
            Staff staff = staffRepository.findByAccountId(account.getAccountId()).orElseGet(() -> Staff.builder()
                    .account(account)
                    .createdAt(LocalDateTime.now())
                    .build());
            staff.setAccount(account);
            staff.setFullName(fullName);
            staff.setPosition(position);
            staff.setPhoneNumber("0900000000");
            staff.setBuilding(building);
            staffRepository.save(staff);
        } else {
            Student student = studentRepository.findByAccountId(account.getAccountId()).orElseGet(() -> Student.builder()
                    .accountId(account)
                    .studentCode("STD" + account.getAccountId())
                    .status(StudentStatus.Active)
                    .build());
            student.setAccountId(account);
            student.setStudentCode(student.getStudentCode() != null ? student.getStudentCode() : "STD" + account.getAccountId());
            student.setFullName(fullName);
            student.setGender(Gender.Male);
            student.setPhoneNumber("0911111111");
            student.setClassName("D19CNTT");
            student.setStatus(StudentStatus.Active);
            studentRepository.save(student);
        }
    }

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build()));
    }
}
