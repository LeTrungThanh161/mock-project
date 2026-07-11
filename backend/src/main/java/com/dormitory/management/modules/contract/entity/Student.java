package com.dormitory.management.modules.contract.entity;

import com.dormitory.management.constants.Gender;
import com.dormitory.management.constants.StudentStatus;
import com.dormitory.management.modules.auth.entity.Account;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer studentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accountId", unique = true)
    private Account account;

    @Column(nullable = false, unique = true, length = 20)
    private String studentCode;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Column(length = 15)
    private String phoneNumber;

    @Column(name = "Class", length = 50)
    private String className;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudentStatus status;
}
