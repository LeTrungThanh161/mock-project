package com.dormitory.management.modules.auth.service;

import com.dormitory.management.constants.AccountStatus;
import com.dormitory.management.constants.StudentStatus;
import com.dormitory.management.modules.auth.dto.*;
import com.dormitory.management.modules.auth.entity.Account;
import com.dormitory.management.modules.auth.entity.Role;
import com.dormitory.management.modules.auth.entity.Staff;
import com.dormitory.management.modules.auth.repository.AccountRepository;
import com.dormitory.management.modules.auth.repository.RoleRepository;
import com.dormitory.management.modules.auth.repository.StaffRepository;
import com.dormitory.management.modules.auth.security.JwtService;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Đăng nhập: xác thực email/password, tạo JWT, trả về thông tin role + buildingId.
     */
    public LoginResponse login(LoginRequest request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Email không tồn tại: " + request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new BadCredentialsException("Sai mật khẩu");
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Tài khoản đang bị khoá hoặc vô hiệu hoá");
        }

        String roleName = account.getRole().getRoleName(); // Student / Manager / Admin
        Integer buildingId = null;
        String fullName = "";

        if ("Manager".equals(roleName) || "Admin".equals(roleName)) {
            Staff staff = staffRepository.findByAccountId(account.getAccountId()).orElse(null);
            if (staff != null) {
                fullName = staff.getFullName();
                if (staff.getBuilding() != null) {
                    buildingId = staff.getBuilding().getBuildingId();
                }
            }
        } else {
            // Student
            Student student = studentRepository.findByAccountId(account.getAccountId()).orElse(null);
            if (student != null) {
                fullName = student.getFullName();
            }
        }

        String token = jwtService.generateToken(account.getAccountId(), roleName, buildingId, account.getEmail());

        // Cập nhật lastLoginAt
        account.setLastLoginAt(LocalDateTime.now());
        accountRepository.save(account);

        return LoginResponse.builder()
                .token(token)
                .role(roleName)
                .buildingId(buildingId)
                .fullName(fullName)
                .email(account.getEmail())
                .build();
    }

    /**
     * Đăng ký tài khoản Student mới.
     */
    @Transactional
    public void register(RegisterRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại: " + request.getEmail());
        }

        Role studentRole = roleRepository.findByRoleName("Student")
                .orElseThrow(() -> new IllegalStateException("Role Student không tồn tại trong DB"));

        Account account = Account.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(AccountStatus.ACTIVE)
                .role(studentRole)
                .createdAt(LocalDateTime.now())
                .build();
        account = accountRepository.save(account);

        Student student = Student.builder()
                .account(account)
                .studentCode(request.getStudentCode())
                .fullName(request.getFullName())
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .className(request.getClassName())
                .status(StudentStatus.ACTIVE)
                .build();
        studentRepository.save(student);
    }

    /**
     * Lấy thông tin tài khoản hiện tại từ accountId trong JWT.
     */
    public MeResponse getMe(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new UsernameNotFoundException("Tài khoản không tồn tại"));

        String roleName = account.getRole().getRoleName();
        Integer buildingId = null;
        String fullName = "";

        if ("Manager".equals(roleName) || "Admin".equals(roleName)) {
            Staff staff = staffRepository.findByAccountId(accountId).orElse(null);
            if (staff != null) {
                fullName = staff.getFullName();
                if (staff.getBuilding() != null) {
                    buildingId = staff.getBuilding().getBuildingId();
                }
            }
        } else {
            Student student = studentRepository.findByAccountId(accountId).orElse(null);
            if (student != null) fullName = student.getFullName();
        }

        return MeResponse.builder()
                .accountId(accountId)
                .email(account.getEmail())
                .role(roleName)
                .buildingId(buildingId)
                .fullName(fullName)
                .build();
    }
}
