package com.dormitory.management.modules.contract.service;

import com.dormitory.management.modules.auth.repository.AccountRepository;
import com.dormitory.management.modules.contract.dto.StudentResponse;
import com.dormitory.management.modules.contract.dto.StudentUpdateRequest;
import com.dormitory.management.modules.contract.entity.Student;
import com.dormitory.management.modules.contract.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final AccountRepository accountRepository;

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

    private StudentResponse mapToResponse(Student student) {
        return StudentResponse.builder()
                .studentId(student.getStudentId())
                .studentCode(student.getStudentCode())
                .fullName(student.getFullName())
                .gender(student.getGender())
                .phoneNumber(student.getPhoneNumber())
                .className(student.getClassName())
                .status(student.getStatus())
                .build();
    }
}
