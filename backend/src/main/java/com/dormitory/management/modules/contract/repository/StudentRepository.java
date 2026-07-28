package com.dormitory.management.modules.contract.repository;

import com.dormitory.management.modules.contract.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.Optional;


public interface StudentRepository extends JpaRepository<Student, Integer> {

    @Query(value = "SELECT * FROM Student WHERE AccountId = :accountId", nativeQuery = true)
    Optional<Student> findByAccountId(@Param("accountId") Integer accountId);

    boolean existsByStudentCode(String studentCode);
}
